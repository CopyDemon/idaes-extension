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
exports.default = runTerminalCommand;
const cp = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
/**
 * A helper function to execute a terminal command asynchronously.
 * Runs the given command in the specified shell. Once the command completes,
 * it reads and parses the JSON content from the output file.
 *
 * Note: The parsed data from the callback is not returned to the caller.
 * The function returns the ChildProcess instance for process management.
 *
 * @param context - The vscode context
 * @param command - The terminal command to execute (e.g., "source .zshrc && conda activate env && idaes-run ...")
 * @param shell - The shell executable path (e.g., "/bin/zsh", "/bin/bash", or "C:\\Windows\\System32\\powershell.exe")
 * @param outputFilePath - The file path where the command writes its output data
 * @param vscodeContextStateName - The name of the vscode context state to update
 * @returns The ChildProcess instance from cp.exec
 */
function runTerminalCommand(context, command, shell, outputFilePath, vscodeContextStateName) {
    if (!context) {
        console.log(`RunterminalCommand request context as param!`);
        return;
    }
    if (!command) {
        console.log(`RunterminalCommand request command as param!`);
        return;
    }
    if (!shell) {
        console.log(`RunterminalCommand request shell as param!`);
        return;
    }
    if (!outputFilePath) {
        console.log(`RunterminalCommand request outputFilePath as param!`);
        return;
    }
    console.log(`
            Starting execute terminal command:
            ${command}
            Treminal environment is:
            ${shell}
            Output file path is:
            ${outputFilePath}
            ...
    `);
    // start execute terminal command and write to outputFilePath, then write to context.globalState.vscodeContextStateName
    cp.exec(command, { shell: shell }, (error, stdout, stderr) => {
        if (error) {
            console.error(`tree view try to execute idaes-run show error: ${error}`);
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`Finished run shell command and Starting to read data from output file, file path is: ${outputFilePath}`);
        console.log(`Start to reading data from ${outputFilePath}`);
        const configContent = fs.readFileSync(outputFilePath, 'utf8');
        const data = JSON.parse(configContent);
        console.log(`Finished reading data from ${outputFilePath}.`);
        console.log(`Now starting to write data into vscode globalState ${vscodeContextStateName}`);
        context.globalState.update(vscodeContextStateName, data);
        console.log(`Finished write into vscode globalState at ${vscodeContextStateName}`);
        console.log(`Start to verify if global context as same as ${outputFilePath} 's content`);
        const readNewGlobalStateData = context.globalState.get(vscodeContextStateName);
        if (JSON.stringify(data) !== JSON.stringify(readNewGlobalStateData)) {
            console.error(`
                runTerminalCommand rais error: fail to compare ${outputFilePath} 's content and vscode.globalState.${vscodeContextStateName} 's data, they are not equal!

                The data from ${outputFilePath} is: ${JSON.stringify(data)}
                The data from ${vscodeContextStateName} is: ${JSON.stringify(readNewGlobalStateData)}
                `);
            return;
        }
        else {
            console.log(`Successfully update data from ${outputFilePath}, to vscode.globalState.${vscodeContextStateName}`);
            console.log(`
                If you want to use the data from ${outputFilePath}, you can use context.globalState.get('${vscodeContextStateName}')
                `);
        }
    });
}
//# sourceMappingURL=execute_terminal_command.js.map