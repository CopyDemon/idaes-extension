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
exports.default = treeview;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const get_webview_template_1 = require("../util/get_webview_template");
const webview_handler_1 = require("../util/webview_handler");
const trim_file_name_1 = require("../util/trim_file_name");
const extensionHandler_1 = require("../util/extensionHandler");
const webview_receive_message_handler_1 = __importDefault(require("../util/webview_receive_message_handler"));
const run_terminal_command_1 = __importDefault(require("../util/run_terminal_command"));
function treeview(context) {
    return {
        async resolveWebviewView(webviewView) {
            webviewView.webview.options = {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src'))]
            };
            // define webview template
            webviewView.webview.html = (0, get_webview_template_1.getReactTemplate)(context, webviewView.webview, '', '');
            // register webview
            (0, webview_handler_1.registerWebview)("treeView", webviewView);
            //Get current activate tab's file name
            let fileName = context.globalState.get("activatedFileName") ?? '';
            //Get config data from vscode global state
            // const extensionConfigData: IExtensionConfig | undefined = context.globalState.get("extensionConfig");
            const extensionConfigData = (0, extensionHandler_1.readExtensionConfig)(context);
            let reactReady = false;
            // register message handler immediately so UI can update configs
            webviewView.webview.onDidReceiveMessage(message => {
                if (message.type === "updateExtensionConfig") {
                    (0, extensionHandler_1.updateExtensionConfig)(context, message.content);
                }
                else if (message.type === "error") {
                    vscode.window.showErrorMessage(message.content);
                    console.error(`Received error from frontend: ${message.content}`);
                }
                else if (message.frontendInstruction === 'ready') {
                    reactReady = true;
                }
                else {
                    (0, webview_receive_message_handler_1.default)(context, message);
                }
            });
            // check if has extension config, if not show error message and return
            if (!extensionConfigData) {
                // when extension config not found from global state, show error message
                webviewView.webview.postMessage({
                    error: "Error at loading tree view!Config not found! Please set the config first!"
                });
                return;
            }
            if (!fileName.endsWith('.py')) {
                vscode.window.showErrorMessage("Please open a python flowsheet file to use IDAES extension.");
                if (reactReady || true) { // Always post initial config so UI populates
                    webviewView.webview.postMessage({
                        type: "init",
                        content: '',
                        idaesRunInfo: null,
                        fileName: fileName !== '' ? (0, trim_file_name_1.trimFileName)(fileName) : 'No file selected',
                        loadApp: 'treeView'
                    });
                    webviewView.webview.postMessage({
                        type: "readExtensionConfig",
                        content: extensionConfigData,
                    });
                }
                return;
            }
            // when pass extension check start to build terminal commands
            // get command config data
            const sorceCommand = extensionConfigData.sorce_treminal; //e.g source .zshrc
            const activateCommand = extensionConfigData.activate_command; //e.g conda activate idaes_dev
            const outputFileName = extensionConfigData.output_file_name; //e.g idaes_run_info.json
            const shellType = "/bin/zsh";
            // construct the idaes-run info command
            const commandIdaesRunInfo = `${sorceCommand} && ${activateCommand} && idaes-run "${fileName}" "${outputFileName}" --info`;
            let stepsData;
            try {
                // await the terminal command to finish, then use the resolved data
                stepsData = await (0, run_terminal_command_1.default)(context, commandIdaesRunInfo, shellType, outputFileName, "currentFileInfo");
                console.log(stepsData);
            }
            catch (err) {
                console.error(`Error running terminal command during tree view load: ${err.message}`);
                vscode.window.showErrorMessage(`Failed to load flowsheet info: ${err.message}. Please check your configuration.`);
                stepsData = null; // UI can gracefully handle empty data
            }
            if (reactReady || true) { // Always post initial config so UI populates
                if (stepsData) {
                    webviewView.webview.postMessage({
                        type: "init",
                        content: '',
                        idaesRunInfo: stepsData,
                        fileName: fileName !== '' ? (0, trim_file_name_1.trimFileName)(fileName) : 'File name undefined',
                        loadApp: 'treeView'
                    });
                }
                // send extension config to react.
                webviewView.webview.postMessage({
                    type: "readExtensionConfig",
                    content: extensionConfigData, // extension data send to react set tree view config input value
                });
            }
        }
    };
}
//# sourceMappingURL=treeview.js.map