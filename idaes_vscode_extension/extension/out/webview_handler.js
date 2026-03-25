"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateWebviews = void 0;
exports.registerWebview = registerWebview;
exports.unregisterWebview = unregisterWebview;
exports.brodcastMessage = brodcastMessage;
// define a set to store all active webviews
const activateWebviews = new Set();
exports.activateWebviews = activateWebviews;
// register a webview
function registerWebview(webview) {
    activateWebviews.add(webview);
}
// unregister a webview
function unregisterWebview(webview) {
    activateWebviews.delete(webview);
}
// brodcast message to all active webviews
function brodcastMessage(message) {
    console.log(`Brodcasting message: ${JSON.stringify(message)} to all active webviews...`);
    if (activateWebviews.size === 0) {
        console.log('No active webviews found! Cannot brodcast message!');
        return;
    }
    activateWebviews.forEach(webview => {
        webview.webview.postMessage(message);
    });
    console.log('Successfully brodcasted message to all active webviews!');
}
//# sourceMappingURL=webview_handler.js.map