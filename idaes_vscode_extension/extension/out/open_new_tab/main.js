"use strict";
/**
 * When open a new tab it means open extension webview
 * it contains 3 panels
 * 1. top left panel: show the content of the current file
 * 2. top right panel: show the content of the extension edit file (maybe)
 * 3. bottom panel: show webview contain webview mermaid diagram, button, etc.
 */
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
exports.reloadCurrentWebview = void 0;
exports.openNewTab = openNewTab;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const get_webview_template_1 = require("./get_webview_template");
const index_1 = require("../reload_webview/index");
Object.defineProperty(exports, "reloadCurrentWebview", { enumerable: true, get: function () { return index_1.reloadCurrentWebview; } });
// Store active panel globally so we can reload it
let currentPanel;
let currentContext;
async function openNewTab(context) {
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
    // Create a Webview Panel with split layout (top and bottom sections)
    const panel = vscode.window.createWebviewPanel('idaesSplitView', `IDAES Extension: current related file: ${document.fileName.split('/').pop()}`, vscode.ViewColumn.Beside, // Open beside current editor
    // vscode.ViewColumn.Active,
    {
        enableScripts: true,
        // Enable local resource loading
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src'))]
    });
    // Store panel and context for hot reload
    currentPanel = panel;
    currentContext = context;
    // Function to reload webview content
    function reloadWebview() {
        if (currentPanel && currentContext) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                currentPanel.webview.html = (0, get_webview_template_1.getSplitPanelContent)(currentContext, editor.document.getText(), editor.document.fileName);
                console.log('🔄 Webview reloaded!');
            }
        }
    }
    // Set Webview HTML content - split layout
    panel.webview.html = (0, get_webview_template_1.getSplitPanelContent)(context, content, fileName);
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
            panel.webview.postMessage({
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
    // Clean up listeners when panel is disposed
    panel.onDidDispose(() => {
        changeDocumentSubscription.dispose();
        templateWatcher.dispose();
        currentPanel = undefined;
        currentContext = undefined;
    });
}
;
//# sourceMappingURL=main.js.map