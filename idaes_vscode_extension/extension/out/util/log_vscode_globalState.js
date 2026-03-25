"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = logVscodeGlobalState;
function logVscodeGlobalState(context) {
    const allKeys = context.globalState.keys();
    console.log("=== All globalState keys and values ===");
    allKeys.forEach(key => {
        console.log(`${key}:`, JSON.stringify(context.globalState.get(key)));
    });
    console.log("=== End of globalState ===");
}
//# sourceMappingURL=log_vscode_globalState.js.map