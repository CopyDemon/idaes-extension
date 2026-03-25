"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.openWebview = openWebview;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const cp = __importStar(require("child_process"));
const get_webview_template_1 = require("../util/get_webview_template");
// Store active panel globally so we can reload it
let currentPanel;
let currentContext;
async function openWebview(context, outputFileName) {
    // Get the current active editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found!');
        return;
    }
    // Get the current document content
    const document = editor.document;
    const content = document.getText();
    const fileName = document.fileName;
    console.log("opened new tab:");
    console.log(fileName);
    // Create a Webview Panel with split layout (top and bottom sections)
    const webViewPanel = vscode.window.createWebviewPanel('idaesWebview', `IDAES Extension - webview for: ${fileName.split('/').pop()}`, 
    // vscode.ViewColumn.Beside, // Open beside current editor
    vscode.ViewColumn.One, // Open beside current editor
    // vscode.ViewColumn.Active,
    {
        enableScripts: true,
        // Enable local resource loading (the React rendered static html css js files)
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src'))]
    });
    // Store panel and context for hot reload
    currentPanel = webViewPanel;
    currentContext = context;
    // Set Webview HTML content - split layout
    webViewPanel.webview.html = (0, get_webview_template_1.getReactTemplate)(context, webViewPanel.webview, content, fileName);
    // editorPanel.webview.html = getReactTemplate(context, webViewPanel.webview, content, fileName);
    // Function to reload webview content
    function reloadWebview() {
        if (currentPanel && currentContext) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                webViewPanel.webview.html = (0, get_webview_template_1.getReactTemplate)(currentContext, webViewPanel.webview, editor.document.getText(), editor.document.fileName);
                console.log('🔄 Webview reloaded!');
            }
        }
    }
    // Watch template files for changes (HOT RELOAD)
    const templateWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(context.extensionPath, 'src/webview_template/**/*.{html,css,js}'));
    templateWatcher.onDidChange(() => {
        console.log('📝 Template file changed, reloading...');
        reloadWebview();
    });
    // Listen to document changes and update webview in real-time
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
        // Only listen to changes in the current document
        if (e.document.uri.toString() === document.uri.toString()) {
            const updatedContent = e.document.getText();
            const diagramContent = getDiagramContent(e.document);
            // Send update message to webview
            webViewPanel.webview.postMessage({
                type: 'update',
                content: updatedContent,
                fileName: e.document.fileName,
                diagramContent: diagramContent
            });
        }
    });
    function getDiagramContent(document) {
        const documentContent = document.getText();
        // base on //diagram to // diagram end to find out all diagram content
        const diagramContent = documentContent.split('//diagram')[1]?.split('//diagram end')[0] || '';
        return diagramContent;
    }
    // Listen to messages from webview
    webViewPanel.webview.onDidReceiveMessage(message => {
        const outFileName = outputFileName ? outputFileName : `${require('os').homedir()}/Downloads/out1.json`;
        switch (message.frontendInstruction) {
            case 'ready':
                // React is ready, send initial data
                const configFileName = `${require('os').homedir()}/Downloads/config.json`;
                webviewReady(webViewPanel, content, fileName, configFileName);
                break;
            case 'run_flowsheet':
                if (message.selectedSteps) {
                    // if has steps run steps
                    const steps = message.selectedSteps;
                    runFlowsheetWithFlowsheetRunner(fileName, outFileName, webViewPanel, steps);
                }
                else {
                    // else is run all steps
                    runFlowsheetWithFlowsheetRunner(fileName, outFileName, webViewPanel);
                }
                break;
        }
    }, undefined, context.subscriptions);
    // Clean up listeners when panel is disposed
    webViewPanel.onDidDispose(() => {
        changeDocumentSubscription.dispose();
        templateWatcher.dispose();
        currentPanel = undefined;
        currentContext = undefined;
    });
    // below are open a tree view
    // const treeViewPanel = vscode.window.createWebviewPanel(
    //     'idaesTreeView',
    //     `IDAES Extension - tree view for: ${fileName.split('/').pop()}`,
    //     // vscode.ViewColumn.Beside, // Open beside current editor
    //     vscode.ViewColumn.One, // Open beside current editor
    //     // vscode.ViewColumn.Active,
    //     {
    //         enableScripts: true,
    //         // Enable local resource loading (the React rendered static html css js files)
    //         localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src'))]
    //     }
    // );
}
;
/**
 * Initialize the webview content
 * Send the initial data to the webview, now it sendback the active file content and file name
 * @param panel WebviewPanel
 * @param content string the activated file content
 * @param fileName string the activated file name
 */
function webviewReady(panel, content, fileName, outputFileName) {
    // TODO: this is async and before terminal command executed the post message will be sent
    cp.exec(`source ~/.zshrc && conda activate idaes-extension-12 && idaes-run ${fileName} ${outputFileName} --info`, { shell: '/bin/zsh' }, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
            panel.webview.postMessage({
                type: 'error',
                message: error.message
            });
            return;
        }
        else {
            //read config data
            const configContent = fs.readFileSync(outputFileName, 'utf8');
            const configData = JSON.parse(configContent);
            // post successful init to webview
            panel.webview.postMessage({
                type: 'init',
                content: content,
                configData: configData,
                fileName: fileName,
                loadApp: 'webview'
            });
        }
    });
}
/**
 * Terminal execution
 * Run terminal command to run current activated flowsheet file with flowsheet runner
 * (currently the activated flowsheet must be wrapped)
 * This will output a json file, later use to send back to webview
 *
 * @param fileName the absolute path of the flowsheet file
 * @param outputFile the absolute path of the output file
 * @param panel the webview panel
 *
 */
function runFlowsheetWithFlowsheetRunner(fileName, outputFile, panel, step) {
    if (!step) {
        cp.exec(`source ~/.zshrc && conda activate idaes-extension-12 && idaes-run ${fileName} ${outputFile}`, { shell: '/bin/zsh' }, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
                panel.webview.postMessage({
                    type: 'error',
                    message: error.message
                });
                return;
            }
            readJSONFileSendToWebview(outputFile, panel);
        });
    }
    else {
        cp.exec(`source ~/.zshrc && conda activate idaes-extension-12 && idaes-run ${fileName} ${outputFile} --to ${step}`, { shell: '/bin/zsh' }, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
                panel.webview.postMessage({
                    type: 'error',
                    message: error.message
                });
                return;
            }
            readJSONFileSendToWebview(outputFile, panel);
        });
    }
}
/**
 * Read JSON file and send back to webview
 * @param outputFile the absolute path of the output file
 * @param panel the webview panel
 */
function readJSONFileSendToWebview(outputFile, panel) {
    fs.readFile(outputFile, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            panel.webview.postMessage({
                type: 'error',
                message: err.message
            });
            return;
        }
        // Send JSON back to webview
        panel.webview.postMessage({
            type: 'flowsheet_detail',
            data: JSON.parse(data)
        });
    });
}
//# sourceMappingURL=open_new_tab.js.map