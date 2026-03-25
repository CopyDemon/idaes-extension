"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateWebviews = void 0;
exports.registerWebview = registerWebview;
exports.unregisterWebview = unregisterWebview;
exports.getWebview = getWebview;
exports.brodcastMessage = brodcastMessage;
// define a set to store all active webviews
const activateWebviews = new Map();
exports.activateWebviews = activateWebviews;
// register a webview
function registerWebview(name, webview) {
    activateWebviews.set(name, webview);
}
// unregister a webview
function unregisterWebview(name) {
    activateWebviews.delete(name);
}
// get a webview by name
function getWebview(name) {
    return activateWebviews.get(name);
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