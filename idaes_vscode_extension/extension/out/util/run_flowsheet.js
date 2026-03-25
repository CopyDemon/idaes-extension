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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = runFlowsheet;
const vscode = __importStar(require("vscode"));
const webview_handler_1 = require("./webview_handler");
const run_terminal_command_1 = __importDefault(require("./run_terminal_command"));
const variable_view_1 = __importDefault(require("../varibale_view/variable_view"));
async function runFlowsheet(context, webview, selectedStep) {
    try {
        const activateFileName = context.globalState.get("activatedFileName");
        const extensionConfig = context.globalState.get("extensionConfig");
        // read run_flowsheet necessary params
        let activateCommand = undefined;
        let sourceTerminal = undefined;
        let outputFileName = undefined;
        let shell = undefined;
        let vscodeContextStateName = 'flowsheetRunResult';
        if (extensionConfig) {
            sourceTerminal = extensionConfig.sorce_treminal;
            activateCommand = extensionConfig.activate_command;
            outputFileName = extensionConfig.output_file_name;
            shell = extensionConfig.shell;
        }
        // error handler if missing param
        if (!sourceTerminal || !activateCommand || !outputFileName || !shell || !vscodeContextStateName) {
            webview.postMessage({
                type: 'error',
                message: `run_flowsheet raise an error, looks like you are trying to run a flowsheet, but missing one of following params: [
                    sourceTerminal: ${sourceTerminal}, 
                    activateCommand: ${activateCommand},
                    outputFileName: ${outputFileName},
                    shell: ${shell},
                    vscodeContextStateName: ${vscodeContextStateName}
                From file webview_receive_message_handler.ts`
            });
            return;
        }
        // if webview is closed then open it to prevent extension cant find webview
        if (!webview_handler_1.activateWebviews.get('variableView')) {
            await (0, variable_view_1.default)(context);
        }
        // GUARD: Prevent arbitrary file overwriting (e.g. wiping out ~/.zshrc)
        if (!outputFileName.toLowerCase().trim().endsWith('.json')) {
            vscode.window.showErrorMessage(`DANGER: Target output file "${outputFileName}" must be a .json file! Or it may overwrite your files. Check Extension Settings.`);
            webview.postMessage({
                type: 'error',
                message: `run_flowsheet aborted: The 'Output File Name' parameter (${outputFileName}) must be a .json file. Refusing to execute to prevent overwriting critical system files.`
            });
            return;
        }
        // run command
        let command = `${sourceTerminal} && ${activateCommand} && idaes-run "${activateFileName}" "${outputFileName}"`;
        if (selectedStep) {
            command += ` --to ${selectedStep}`;
        }
        console.log(`Run command: ${command}`);
        // Broadcast a signal to clear logs across ALL active webviews BEFORE starting new command
        (0, webview_handler_1.brodcastMessage)({ type: 'clear_terminal_logs' });
        await (0, run_terminal_command_1.default)(context, command, shell, outputFileName, vscodeContextStateName);
        let webViewPanel = webview_handler_1.activateWebviews.get('webView');
        let variableViewPanel = webview_handler_1.activateWebviews.get('variableView');
        let treePanel = webview_handler_1.activateWebviews.get('treeView');
        let flowsheetRunResult = context.globalState.get(vscodeContextStateName);
        if (!variableViewPanel) {
            console.error('variable view panel not found - user may not have opened the variable view tab');
            return;
        }
        if (!webViewPanel) {
            console.log('web view panel not found, proactively opening it...');
            await openWebViewPanel(context);
            webViewPanel = webview_handler_1.activateWebviews.get('webView');
            if (!webViewPanel) {
                console.error('webView panel still not found after attempting to open it');
                return;
            }
        }
        if (!treePanel) {
            console.error('tree view not found!');
            return;
        }
        if (!flowsheetRunResult) {
            console.error('flowsheet run result not found');
            webViewPanel.webview.postMessage({
                type: 'error',
                message: 'finished running the flowsheet, butflowsheet run result not found'
            });
            return;
        }
        console.log('Start post run flowsheet done to all panels');
        // post flowsheet result to variable view
        variableViewPanel.webview.postMessage({
            type: "flowsheet_runner_result",
            data: flowsheetRunResult
        });
        // post flowsheet result to web view
        webViewPanel.webview.postMessage({
            type: 'flowsheet_runner_result',
            data: flowsheetRunResult
        });
        // post flowsheet result to tree view
        treePanel.webview.postMessage({
            type: 'flowsheet_runner_result',
            data: flowsheetRunResult
        });
        // this is telling tree panel to cancel the loading animation
        treePanel.webview.postMessage({
            type: 'run_flowsheet_done',
        });
        console.log('Done');
        // mermaid content handler post mermaid diagram to web view or log error
        // const mermaidContent = flowsheetRunResult.actions.mermaid_diagram;
        // if (mermaidContent) {
        //     console.log(`Find mermaid content from flowsheet run result:`);
        //     console.log(`mermaid content: ${JSON.stringify(mermaidContent)}`);
        //     console.log(`Now sending mermaid content back to web view...`);
        //     webViewPanel.webview.postMessage({
        //         type: "update_mermaid_diagram",
        //         data: mermaidContent
        //     });
        //     console.log(`Done.`);
        // } else {
        //     console.error('mermaid content not found');
        // }
    }
    catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        if (errorMessage.startsWith('CANCELED_BY_USER')) {
            // Silently swallow the rejection and log to console
            console.log(`runFlowsheet was canceled by the user: ${errorMessage}`);
            const pidChunk = errorMessage.split(':')[1] || '';
            vscode.window.showInformationMessage(`Run flowsheet stopped manually. PID: ${pidChunk}`, 'Click to view').then((selection) => {
                if (selection === 'Click to view') {
                    // Focus the webView panel (which contains logs)
                    vscode.commands.executeCommand('idaes.webView.focus').then(() => {
                        // Send a broadcast to switch the active tab to 'logs'
                        setTimeout(() => {
                            (0, webview_handler_1.brodcastMessage)({ type: 'switch_sub_tab', tab_name: 'logs', sub_tab_name: 'terminal' });
                        }, 300);
                    });
                }
            });
            return;
        }
        console.error(`
            runFlowsheet from webview_receive_message_handler.ts raise an error:
            ${e}
        `);
        let webViewPanel = webview_handler_1.activateWebviews.get('webView');
        // if not webview panel try to open it, because the error should send to this panel to show in log
        if (!webViewPanel) {
            await openWebViewPanel(context);
            webViewPanel = webview_handler_1.activateWebviews.get('webView');
            // if still not found then log error
            if (!webViewPanel) {
                console.error('web view panel not found');
                return;
            }
        }
        webViewPanel.webview.postMessage({
            type: 'error',
            message: errorMessage
        });
        // Show VS Code Error UI message with a button
        vscode.window.showErrorMessage('Running flowsheet has an error', 'Click to view').then((selection) => {
            if (selection === 'Click to view') {
                // Focus the webView panel (which contains logs)
                vscode.commands.executeCommand('idaes.webView.focus').then(() => {
                    // Send a broadcast to switch the active tab to 'logs'
                    setTimeout(() => {
                        (0, webview_handler_1.brodcastMessage)({ type: 'switch_sub_tab', tab_name: 'logs', sub_tab_name: 'error' });
                    }, 300);
                });
            }
        });
    }
}
async function openWebViewPanel(context) {
    let webViewPanel = webview_handler_1.activateWebviews.get('webView');
    // Step 1: Open the bottom panel area and the specific extension container
    try {
        await vscode.commands.executeCommand('workbench.action.focusPanel');
        await vscode.commands.executeCommand('workbench.view.extension.idaes-web-view-panel');
    }
    catch (e) {
        (0, webview_handler_1.brodcastMessage)({
            type: 'error',
            message: `focusPanel command failed: ${e}`
        });
    }
    // Step 2: Switch to the idaes web view specifically
    try {
        await vscode.commands.executeCommand('idaes.webView.focus');
    }
    catch (e) {
        console.log('idaes.webView.focus command failed', e);
    }
    // Step 3: Wait until the panel registers itself (retry loop for up to 3 seconds)
    let retries = 0;
    while (!webViewPanel && retries < 15) {
        await new Promise(resolve => setTimeout(resolve, 200));
        webViewPanel = webview_handler_1.activateWebviews.get('webView');
        retries++;
    }
    // Also give the React app inside the webview an extra 1000ms to boot up and be ready for messages
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!webViewPanel) {
        console.error('webView panel still not found after attempting to open it for 3 seconds');
        return;
    }
}
//# sourceMappingURL=run_flowsheet.js.map