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
exports.default = variableView;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const get_webview_template_1 = require("../util/get_webview_template");
const webview_handler_1 = require("../util/webview_handler");
// Store active panel globally so we can reload it
let currentPanel;
let currentContext;
/**
 * Webview is the webview tab in vscode editor part, by update param vscode.ViewColumn.One or beside you can config it open a split panel or a new tab panel in vscode editor part.
 * @param context vscode context
 * @param outputFileName TODO: this need to be removed because the run is in the tree view.
 * @returns
 */
async function variableView(context, outputFileName) {
    // Get the current active editor
    const editor = vscode.window.activeTextEditor;
    let fileName = '';
    if (!editor) {
        // Fallback to activatedFileName from global state if focus is lost (e.g. ran from a webview panel)
        const activatedFileName = context.globalState.get("activatedFileName");
        if (activatedFileName) {
            fileName = activatedFileName;
        }
        else {
            vscode.window.showErrorMessage('No active editor found and no activated flowsheet found either!');
            console.error('Idaes variable view raise an error: fail to find or open the variable view.');
            return;
        }
    }
    else {
        fileName = editor.document.fileName;
    }
    // Create a Webview Panel with split layout (top and bottom sections)
    const variableViewPanel = vscode.window.createWebviewPanel('idaes variable view', `IDAES Extension Variable View - ${fileName.split('/').pop()}`, 
    // vscode.ViewColumn.Beside, // Open beside current editor
    vscode.ViewColumn.Beside, // Open beside current editor
    // vscode.ViewColumn.Active,
    {
        enableScripts: true,
        // Enable local resource loading (the React rendered static html css js files)
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src'))],
        retainContextWhenHidden: true
    });
    (0, webview_handler_1.registerWebview)("variableView", variableViewPanel);
    // Set Webview HTML content - split layout
    variableViewPanel.webview.html = (0, get_webview_template_1.getReactTemplate)(context, variableViewPanel.webview, fileName, '');
    variableViewPanel.webview.onDidReceiveMessage(message => {
        if (message.frontendInstruction === 'ready') {
            variableViewPanel.webview.postMessage({
                type: "init",
                loadApp: 'variableView'
            });
        }
    });
    variableViewPanel.onDidDispose(() => {
        (0, webview_handler_1.unregisterWebview)("variableView");
    });
}
//# sourceMappingURL=variable_view.js.map