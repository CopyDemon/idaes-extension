"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSplitPanelContent = getSplitPanelContent;
function getSplitPanelContent(content, fileName) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>IDAES Split View</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: system-ui, -apple-system, sans-serif;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                }
                
                .top-section {
                    flex: 1;
                    overflow: auto;
                    padding: 20px;
                    border-bottom: 2px solid var(--vscode-panel-border);
                }
                
                .bottom-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                h1 {
                    color: var(--vscode-textLink-foreground);
                    border-bottom: 2px solid var(--vscode-textLink-foreground);
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                    font-size: 1.5em;
                }
                
                pre {
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 15px;
                    border-radius: 5px;
                    overflow-x: auto;
                }
                
                code {
                    font-family: 'Consolas', 'Monaco', monospace;
                    line-height: 1.6;
                }
                
                iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                
                .section-header {
                    background-color: var(--vscode-titleBar-activeBackground);
                    color: var(--vscode-titleBar-activeForeground);
                    padding: 8px 15px;
                    font-weight: bold;
                    font-size: 0.9em;
                }
            </style>
        </head>
        <body>
            <div class="top-section">
                <h1 id="file-name">📄 ${fileName.split('/').pop()}</h1>
                <pre><code id="content">${escapeHtml(content)}</code></pre>
            </div>
            <div class="bottom-section">
                <div class="section-header">🌐 IDAES Website</div>
                <iframe src="http://localhost:8081" sandbox="allow-scripts allow-same-origin"></iframe>
            </div>
            
            <script>
                // Listen to messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    if (message.type === 'update') {
                        // Update file content
                        const contentElement = document.getElementById('content');
                        const fileNameElement = document.getElementById('file-name');
                        
                        if (contentElement) {
                            contentElement.textContent = message.content;
                        }
                        
                        if (fileNameElement && message.fileName) {
                            fileNameElement.textContent = '📄 ' + message.fileName.split('/').pop();
                        }
                    }
                });
            </script>
        </body>
        </html>
    `;
}
// HTML escape function
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
//# sourceMappingURL=webview_template.js.map