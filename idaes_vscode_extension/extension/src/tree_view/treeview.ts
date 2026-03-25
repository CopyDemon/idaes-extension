import * as vscode from 'vscode';
import * as path from 'path';
import { getReactTemplate } from '../util/get_webview_template';
import { IExtensionConfig } from '../interface';
import { registerWebview } from '../util/webview_handler';
import { trimFileName } from '../util/trim_file_name';
import { readExtensionConfig, updateExtensionConfig } from '../util/extensionHandler';
import webviewReceiveMessageHandler from "../util/webview_receive_message_handler";
import runTerminalCommand from '../util/run_terminal_command';

export default function treeview(context: vscode.ExtensionContext) {
    return {
        async resolveWebviewView(webviewView: vscode.WebviewView) {
            webviewView.webview.options = {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src'))]
            };

            // define webview template
            webviewView.webview.html = getReactTemplate(context, webviewView.webview, '', '');

            // register webview
            registerWebview("treeView", webviewView);


            //Get current activate tab's file name
            let fileName = context.globalState.get<string>("activatedFileName") ?? '';

            //Get config data from vscode global state
            // const extensionConfigData: IExtensionConfig | undefined = context.globalState.get("extensionConfig");
            const extensionConfigData = readExtensionConfig(context);

            let reactReady = false;
            // register message handler immediately so UI can update configs
            webviewView.webview.onDidReceiveMessage(
                message => {
                    if (message.type === "updateExtensionConfig") {
                        updateExtensionConfig(context, message.content);
                    } else if (message.type === "error") {
                        vscode.window.showErrorMessage(message.content);
                        console.error(`Received error from frontend: ${message.content}`);
                    } else if (message.frontendInstruction === 'ready') {
                        reactReady = true;
                    } else {
                        webviewReceiveMessageHandler(context, message);
                    }
                }
            );

            // check if has extension config, if not show error message and return
            if (!extensionConfigData) {
                // when extension config not found from global state, show error message
                webviewView.webview.postMessage(
                    {
                        error: "Error at loading tree view!Config not found! Please set the config first!"
                    }
                );
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

            let stepsData: any;
            try {
                // await the terminal command to finish, then use the resolved data
                stepsData = await runTerminalCommand(context, commandIdaesRunInfo, shellType, outputFileName, "currentFileInfo");
                console.log(stepsData);
            } catch (err: any) {
                console.error(`Error running terminal command during tree view load: ${err.message}`);
                vscode.window.showErrorMessage(`Failed to load flowsheet info: ${err.message}. Please check your configuration.`);
                stepsData = null; // UI can gracefully handle empty data
            }

            if (reactReady || true) { // Always post initial config so UI populates
                if (stepsData) {
                    webviewView.webview.postMessage(
                        {
                            type: "init",
                            content: '',
                            idaesRunInfo: stepsData,
                            fileName: fileName !== '' ? trimFileName(fileName) : 'File name undefined',
                            loadApp: 'treeView'
                        }
                    );
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