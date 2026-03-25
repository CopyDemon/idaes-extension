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
exports.default = mermaidview;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const get_webview_template_1 = require("../util/get_webview_template");
const webview_handler_1 = require("../util/webview_handler");
const trim_file_name_1 = require("../util/trim_file_name");
const webview_receive_message_handler_1 = __importDefault(require("../util/webview_receive_message_handler"));
function mermaidview(context) {
    return {
        async resolveWebviewView(webviewView) {
            webviewView.webview.options = {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src'))]
            };
            // define webview template
            webviewView.webview.html = (0, get_webview_template_1.getReactTemplate)(context, webviewView.webview, '', '');
            // register webview
            (0, webview_handler_1.registerWebview)("webView", webviewView);
            //Get current activate tab's file name
            let fileName = context.globalState.get("activatedFileName") ?? '';
            //Get config data from vscode global state
            const extensionConfigData = context.globalState.get("extensionConfig");
            if (!extensionConfigData) {
                // when extension config not found from global state, show error message
                webviewView.webview.postMessage({
                    error: "Error at loading tree view!Config not found! Please set the config first!"
                });
                return;
            }
            else {
                // get command config data
                const sorceCommand = extensionConfigData.sorce_treminal;
                const activateCommand = extensionConfigData.activate_command;
                const outputFileName = extensionConfigData.output_file_name;
                // construct the idaes-run info command
                const cpCommand = `${sorceCommand} && ${activateCommand} && idaes-run ${fileName} ${outputFileName} --info`;
                webviewView.webview.onDidReceiveMessage(message => {
                    if (message.frontendInstruction === 'ready') {
                        webviewView.webview.postMessage({
                            type: "init",
                            content: '',
                            idaesRunInfo: {},
                            fileName: fileName !== '' ? (0, trim_file_name_1.trimFileName)(fileName) : "File name undefined",
                            loadApp: 'webView'
                        });
                    }
                    else {
                        (0, webview_receive_message_handler_1.default)(context, message);
                    }
                });
            }
        }
    };
}
//# sourceMappingURL=mermaid_view.js.map