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
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const reload_window_1 = require("./util/reload_window");
const webview_handler_1 = require("./util/webview_handler");
const setDefaultExtensionConfig_1 = require("./util/setDefaultExtensionConfig");
const variable_view_1 = __importDefault(require("./varibale_view/variable_view"));
const treeview_1 = __importDefault(require("./tree_view/treeview"));
const web_view_1 = __importDefault(require("./web_view/web_view"));
const activate_tab_handler_1 = __importDefault(require("./util/activate_tab_handler"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "idaes-extension" is now active!');
    // Override console.error to automatically broadcast all extension errors to the React frontend
    const originalConsoleError = console.error;
    console.error = (...args) => {
        originalConsoleError(...args);
        try {
            const message = args.map(a => typeof a === 'object' ? (a instanceof Error ? a.stack || a.message : JSON.stringify(a)) : String(a)).join(' ');
            (0, webview_handler_1.brodcastMessage)({
                type: 'error',
                message: message
            });
        }
        catch (e) {
            originalConsoleError('Failed to broadcast error to frontend', e);
        }
    };
    /**
     * This command is used to setup and check the default config for the extension.
     * It will load when extension is activated.
     */
    (0, setDefaultExtensionConfig_1.setDefaultConfig)(context);
    /**
     * This command is used to listen to the tab change event.
     * It will load when extension is activated.
     */
    (0, activate_tab_handler_1.default)(context);
    // TODO:
    // add check:
    // check can't stay in registerCommand or it won't run automatically.
    // . check all required packages and packages commands if not match requirement, will show error
    // . if all requirements are met, will show information message idaes extension is started
    /*
     * All commands has been defined in the package.json file
     * Now provide the implementation of the command with registerCommand
     * The commandId parameter must match the command field in package.json
     */
    // initial extension
    /**
     * Initial extension command
     * This command is used to initial the extension, it will be executed when the extension is activated.
     * 1. check all required packages and packages commands if not match requirement, will show error
     * 2. if all requirements are met, will show information message idaes extension is started
     */
    const initialExtensionCommand = vscode.commands.registerCommand('idaes-extension.start', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Starting idaes_extension!');
        vscode.window.showInformationMessage('idaes extension is started!');
    });
    // Register the IDAES Tree View in the sidebar
    const treeView = vscode.window.registerWebviewViewProvider('idaes.treeView', (0, treeview_1.default)(context), {
        webviewOptions: { retainContextWhenHidden: true }
    });
    // Register the IDAES Mermaid View in the bottom panel
    const idaesWebView = vscode.window.registerWebviewViewProvider('idaes.webView', (0, web_view_1.default)(context), {
        webviewOptions: { retainContextWhenHidden: true }
    });
    /**
     * Open new tab command
     * This open new tab is like md file preview function in vscode, the open icon is shows on the
     * tab bar.
     * When click the open icon it will open 2 tab window:
     * 1. beside the current editor a text editor view show code
     * 2. the webview window show diagram, button nasted var etc.
     */
    const registerVariableView = vscode.commands.registerCommand('idaes-extension.openVariableView', () => (0, variable_view_1.default)(context));
    /**
     * Reload webview command
     * This command is used for development, it will reload the webview when you change the webview code.
     * with this command you have no need to open and close the debug mode every time you change the webview code.
     */
    const reloadWebviewCommand = vscode.commands.registerCommand('idaes-extension.reloadWebview', () => {
        (0, reload_window_1.reloadCurrentWebview)();
        vscode.window.showInformationMessage('🔄 Webview reloaded!');
    });
    context.subscriptions.push(initialExtensionCommand, registerVariableView, treeView, idaesWebView, reloadWebviewCommand);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map