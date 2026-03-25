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
exports.default = activateTabListener;
const vscode = __importStar(require("vscode"));
const webview_handler_1 = require("./webview_handler");
const trim_file_name_1 = require("./trim_file_name");
function activateTabListener(context) {
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            const currentActivateTabFileName = editor.document.fileName;
            if (currentActivateTabFileName.includes('.py')) {
                // update global state activateFileName to current activated file's name
                console.log("Current activate tab file name is:", currentActivateTabFileName);
                console.log(`Updating global state activated file name to ${currentActivateTabFileName}`);
                const previousActivatedFileName = context.globalState.get("activatedFileName");
                context.globalState.update("activatedFileName", currentActivateTabFileName);
                console.log('Activated file name is updated!');
                // trim file name and let it can be use by frontend app
                console.log('Get file name from activate file path');
                const activateFileName = (0, trim_file_name_1.trimFileName)(currentActivateTabFileName);
                console.log(`Current activate file name is: ${activateFileName}`);
                // brodcast to all web app panel notice tab is switched
                console.log('Brodcast switch_tab to all web app panels');
                (0, webview_handler_1.brodcastMessage)({
                    type: 'switch_tab',
                    message: `switch tab from ${previousActivatedFileName} to ${currentActivateTabFileName}`,
                    activate_tab_name: activateFileName,
                    time: new Date().toISOString(),
                });
                console.log('Brodcast done.');
            }
            else {
                console.log(`User switched tab, but current activate tab file name is not a python file! The activated tab file is: ${currentActivateTabFileName}`);
            }
        }
        else {
            console.log("User switched tab, and it's not an editor tab!");
        }
    });
}
//# sourceMappingURL=activate_tab_handler.js.map