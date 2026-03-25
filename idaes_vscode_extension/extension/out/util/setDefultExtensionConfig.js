"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultConfig = setDefaultConfig;
const os_1 = __importDefault(require("os"));
function setDefaultConfig(context) {
    // reading user's extension config from vscode global state
    console.log("Checking extension config...");
    console.log("Hint:Config stored at VSCode context.globalState");
    const hasConfigFile = context.globalState.get("extensionConfig");
    if (hasConfigFile) {
        console.log("User's config file found!");
        const userConfig = context.globalState.get("extensionConfig");
        console.log("user's config is:");
        console.log(userConfig);
        console.log("Now use user's config!");
        return;
    }
    else {
        console.log("User's config file not found, creating default config...");
        const defaultOutputDir = os_1.default.homedir();
        const defaultExtensionConfig = {
            activate_command: "conda activate idaes-extension-12",
            sorce_treminal: "source ~/.zshrc",
            output_file_name: `${defaultOutputDir}/Downloads/out1.json`
        };
        context.globalState.update("extensionConfig", defaultExtensionConfig);
        // reading config and log it
        const config = context.globalState.get("extensionConfig");
        console.log("Default config is created! The default config is:");
        console.log(config);
    }
}
//# sourceMappingURL=setDefultExtensionConfig.js.map