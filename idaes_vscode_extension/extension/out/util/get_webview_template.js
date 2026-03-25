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
exports.getReactTemplate = getReactTemplate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function getReactTemplate(context, webview, fileName, content) {
    // Path to the React build output
    const webviewNewPath = path.join(context.extensionPath, 'src', 'webview_template', 'webview_new');
    const htmlPath = path.join(webviewNewPath, 'index.html');
    // Convert local file paths to webview URIs
    const assetsUri = webview.asWebviewUri(vscode.Uri.file(path.join(webviewNewPath, 'assets')));
    // Read HTML content
    let htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    // Replace relative asset paths with webview URIs
    // Vite builds with base: './' will output paths like ./assets/...
    htmlContent = htmlContent.replace(/\.\/assets\//g, `${assetsUri}/`);
    // Also handle /assets/ paths just in case
    htmlContent = htmlContent.replace(/\/assets\//g, `${assetsUri}/`);
    return htmlContent;
}
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
//# sourceMappingURL=get_webview_template.js.map