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
exports.default = webviewReceiveMessageHandler;
const vscode = __importStar(require("vscode"));
const webview_handler_1 = require("./webview_handler");
const run_flowsheet_1 = __importDefault(require("./run_flowsheet"));
const webview_handler_2 = require("./webview_handler");
function webviewReceiveMessageHandler(context, frontendMessage) {
    console.log(`receive frontend instruction: ${JSON.stringify(frontendMessage)}`);
    if (!frontendMessage.fromPanel || !frontendMessage.frontendInstruction) {
        console.log(`Ignoring message missing fromPanel or frontendInstruction: ${JSON.stringify(frontendMessage)}`);
        return;
    }
    const instruction = frontendMessage.frontendInstruction;
    const fromPanel = frontendMessage.fromPanel;
    const webviewPanel = webview_handler_1.activateWebviews.get(fromPanel);
    // Error handler if webviewPanel not found log error.
    // Since no webview was found, the error cannot be posted and is logged instead.
    if (!webviewPanel) {
        console.error(`
        webviewReceiveMessageHandler raise error, webviewPanel not frond from activateWebviews.
        It try to find webviewPanel by name: ${fromPanel}.
        `);
        return;
    }
    switch (instruction) {
        case 'ready':
            frontEndReady(context, webviewPanel.webview);
            console.log('frontend ready!');
            break;
        case 'run_flowsheet':
            console.log(`Receive frontend instruction: run flowsheet`);
            console.log(`Start to run flowsheet`);
            let selectedStep = undefined;
            if (frontendMessage.selectedSteps) {
                selectedStep = frontendMessage.selectedSteps;
            }
            (0, run_flowsheet_1.default)(context, webviewPanel.webview, selectedStep);
            console.log(`Done.`);
            break;
        case 'focus_view':
            console.log(`User is choosing focus view`);
            if (frontendMessage.target) {
                focusView(frontendMessage.target);
            }
            break;
        case 'switch_sub_tab':
            console.log(`Broadcasting switch_sub_tab to all webviews: ${frontendMessage.tab_name}`);
            (0, webview_handler_2.brodcastMessage)({ type: 'switch_sub_tab', tab_name: frontendMessage.tab_name, sub_tab_name: frontendMessage.sub_tab_name });
            break;
        case 'kill_process':
            if (frontendMessage.pid) {
                console.log(`User requested killing process PID: ${frontendMessage.pid}`);
                try {
                    // Send SIGKILL to the process group
                    process.kill(-Number(frontendMessage.pid), 'SIGKILL');
                }
                catch (e) {
                    console.error(`Failed to kill process: ${e}`);
                }
            }
            else {
                console.error('kill_process instruction received but no pid provided.');
            }
            break;
        default:
            console.log(`receive unknown instruction: ${instruction}`);
    }
    return undefined;
}
function frontEndReady(context, webview) {
    console.log(`received ready`);
}
function focusView(webViewName) {
    let internalName = '';
    let openCommand = '';
    if (webViewName === 'webview') {
        internalName = 'variableView';
        openCommand = 'idaes-extension.openVariableView';
    }
    else if (webViewName === 'mermaid') {
        internalName = 'webView';
        openCommand = 'idaes.webView.focus';
    }
    else {
        console.error(`Unknown view name: ${webViewName}`);
        return;
    }
    const webviewPanel = (0, webview_handler_2.getWebview)(internalName);
    if (!webviewPanel) {
        console.log(`webviewPanel ${internalName} not found. Opening it via command ${openCommand}`);
        vscode.commands.executeCommand(openCommand).then(() => {
            // Need to wait for the webview to initialize and React App to load
            setTimeout(() => {
                const refreshedPanel = (0, webview_handler_2.getWebview)(internalName);
                if (refreshedPanel) {
                    refreshedPanel.webview.postMessage({ type: 'highlight_view' });
                }
            }, 1000);
        });
        return;
    }
    // It's open, focus it
    if (internalName === 'variableView') {
        webviewPanel.reveal();
    }
    else {
        vscode.commands.executeCommand(openCommand);
    }
    // Post message to frontend to trigger CSS animation
    webviewPanel.webview.postMessage({ type: 'highlight_view' });
}
//# sourceMappingURL=webview_receive_message_handler.js.map