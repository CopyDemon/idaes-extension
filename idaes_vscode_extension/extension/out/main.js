"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reloadCurrentWebview = exports.openWebview = void 0;
/**
 * When open a new tab it means open extension webview
 * it contains 3 panels
 * 1. top left panel: show the content of the current file
 * 2. top right panel: show the content of the extension edit file (maybe)
 * 3. bottom panel: show webview contain webview mermaid diagram, button, etc.
 */
const open_new_tab_1 = require("./open_new_tab/open_new_tab");
Object.defineProperty(exports, "openWebview", { enumerable: true, get: function () { return open_new_tab_1.openWebview; } });
const reload_window_1 = require("./util/reload_window");
Object.defineProperty(exports, "reloadCurrentWebview", { enumerable: true, get: function () { return reload_window_1.reloadCurrentWebview; } });
//# sourceMappingURL=main.js.map