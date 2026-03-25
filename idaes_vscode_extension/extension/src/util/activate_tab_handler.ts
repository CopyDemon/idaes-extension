import * as vscode from 'vscode';
import { brodcastMessage } from './webview_handler';
import { trimFileName } from './trim_file_name';
export default function activateTabListener(context: vscode.ExtensionContext) {
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
                const activateFileName = trimFileName(currentActivateTabFileName);
                console.log(`Current activate file name is: ${activateFileName}`);

                // brodcast to all web app panel notice tab is switched
                console.log('Brodcast switch_tab to all web app panels');
                brodcastMessage(
                    {
                        type: 'switch_tab',
                        message: `switch tab from ${previousActivatedFileName} to ${currentActivateTabFileName}`,
                        activate_tab_name: activateFileName,
                        time: new Date().toISOString(),
                    }
                );
                console.log('Brodcast done.');
            } else {
                console.log(`User switched tab, but current activate tab file name is not a python file! The activated tab file is: ${currentActivateTabFileName}`);
            }
        } else {
            console.log("User switched tab, and it's not an editor tab!");
        }
    });
}