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
const webview_handler_1 = require("./webview_handler");
/**
 * A helper function to execute a terminal command asynchronously.
 * Runs the given command in the specified shell. Once the command completes,
 * it reads and parses the JSON content from the output file, stores it in
 * vscode globalState, and resolves the Promise with the parsed data.
 *
 * @param context - The vscode context
 * @param command - The terminal command to execute (e.g., "source .zshrc && conda activate env && idaes-run ...")
 * @param shell - The shell executable path (e.g., "/bin/zsh", "/bin/bash", or "C:\\Windows\\System32\\powershell.exe")
 * @param outputFilePath - The file path where the command writes its output data
 * @param vscodeContextStateName - The name of the vscode context state to update
 * @returns A Promise that resolves with the parsed JSON data from the output file
 */
const os = __importStar(require("os"));
function runTerminalCommand(context, command, shell, outputFilePath, vscodeContextStateName) {
    return new Promise((resolve, reject) => {
        if (!context) {
            reject(new Error(`runTerminalCommand requires context as param!`));
            return;
        }
        if (!command) {
            reject(new Error(`runTerminalCommand requires command as param!`));
            return;
        }
        if (!shell) {
            reject(new Error(`runTerminalCommand requires shell as param!`));
            return;
        }
        if (!outputFilePath) {
            reject(new Error(`runTerminalCommand requires outputFilePath as param!`));
            return;
        }
        if (outputFilePath.startsWith('~')) {
            outputFilePath = outputFilePath.replace(/^~/, os.homedir());
        }
        console.log(`
            Starting execute terminal command:
            ${command}
            Terminal environment is:
            ${shell}
            Output file path is:
            ${outputFilePath}
            ...
        `);
        // start execute terminal command and write to outputFilePath, then write to context.globalState.vscodeContextStateName
        (0, webview_handler_1.brodcastMessage)({ type: 'terminal_log', data: `\n[SYSTEM] Executing background process via SPAWN...\nCommand: ${command}\nShell: ${shell}\n` });
        const child = cp.spawn(shell, ['-c', command], {
            detached: true,
            env: Object.assign({}, process.env, { PYTHONUNBUFFERED: "1", FORCE_COLOR: "1" })
        });
        (0, webview_handler_1.brodcastMessage)({ type: 'process_started', pid: child.pid });
        let fullStdout = "";
        let fullStderr = "";
        child.stdout.on('data', (data) => {
            fullStdout += data.toString();
            (0, webview_handler_1.brodcastMessage)({ type: 'terminal_log', data: data.toString() });
        });
        child.stderr.on('data', (data) => {
            fullStderr += data.toString();
            (0, webview_handler_1.brodcastMessage)({ type: 'terminal_log', data: data.toString() });
        });
        child.on('error', (error) => {
            console.error(`runTerminalCommand error: ${error}`);
            (0, webview_handler_1.brodcastMessage)({ type: 'terminal_log', data: `\n[SYSTEM ERROR] Process failed to spawn: ${error}\n` });
            reject(error);
        });
        child.on('close', (code, signal) => {
            console.log(`Finished run shell command with code ${code} and signal ${signal}. Starting to read data from output file: ${outputFilePath}`);
            if (signal === 'SIGKILL' || signal === 'SIGTERM' || signal === 'SIGINT') {
                (0, webview_handler_1.brodcastMessage)({ type: 'terminal_log', data: `\n[SYSTEM] Run flowsheet stopped manually. PID: ${child.pid}\n` });
                reject(new Error(`CANCELED_BY_USER:${child.pid}`));
                return;
            }
            (0, webview_handler_1.brodcastMessage)({ type: 'terminal_log', data: `\n[SYSTEM] Process exited with code ${code}.\nCollected stdout bytes: ${fullStdout.length}\nCollected stderr bytes: ${fullStderr.length}\n` });
            if (code !== 0) {
                let errMsg = `Process failed (exit code ${code}).\n`;
                if (fullStderr.trim()) {
                    errMsg += `[STDERR]:\n${fullStderr.trim()}`;
                }
                else if (fullStdout.trim()) {
                    const lines = fullStdout.trim().split('\n');
                    errMsg += `[ERROR TRACE]:\n${lines.slice(-15).join('\n')}`;
                }
                reject(new Error(errMsg));
                return;
            }
            let data;
            try {
                const configContent = fs.readFileSync(outputFilePath, 'utf8');
                data = JSON.parse(configContent);
            }
            catch (err) {
                console.error(`Failed to read or parse JSON from ${outputFilePath}:`, err);
                (0, webview_handler_1.brodcastMessage)({ type: 'terminal_log', data: `\n[SYSTEM ERROR] Failed to parse output file: ${err}\n` });
                reject(new Error(`Failed to read/parse output file: ${err}`));
                return;
            }
            console.log(`Finished reading data from ${outputFilePath}.`);
            console.log(`Now starting to write data into vscode globalState ${vscodeContextStateName}`);
            context.globalState.update(vscodeContextStateName, data);
            console.log(`Finished write into vscode globalState at ${vscodeContextStateName}`);
            console.log(`Start to verify if global context as same as ${outputFilePath} 's content`);
            const readNewGlobalStateData = context.globalState.get(vscodeContextStateName);
            if (JSON.stringify(data) !== JSON.stringify(readNewGlobalStateData)) {
                console.error(`
                    runTerminalCommand raises error: fail to compare ${outputFilePath} 's content and vscode.globalState.${vscodeContextStateName} 's data, they are not equal!

                    The data from ${outputFilePath} is: ${JSON.stringify(data)}
                    The data from ${vscodeContextStateName} is: ${JSON.stringify(readNewGlobalStateData)}
                    `);
                reject(new Error(`Data verification failed for ${vscodeContextStateName}`));
                return;
            }
            (0, webview_handler_1.brodcastMessage)({ type: 'terminal_log', data: `\n[SYSTEM] Execution finished successfully. JSON parsed.\n` });
            console.log(`Successfully update data from ${outputFilePath}, to vscode.globalState.${vscodeContextStateName}`);
            resolve(data);
        });
    });
}
//# sourceMappingURL=run_terminal_command.js.map