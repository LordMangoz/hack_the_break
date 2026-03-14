// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

let sidebarProvider;

class SidebarProvider {
  constructor(context) {
    this.context = context;
    this._onDidChange = new vscode.EventEmitter();
    this.onDidChange = this._onDidChange.event;
  }

  resolveWebviewView(webviewView, context, token) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = this.getHtmlForWebview();
    this.webview = webviewView.webview;

    // Listen for messages from the webview
    this.webview.onDidReceiveMessage((message) => {
      if (message.command === "pause") {
        const textContent = `<h2>Paused</h2><p>Session paused. Click continue to resume.</p>`;
        this.updateContent(textContent);
      }
      if (message.command === "continue") {
        const textContent = `<h2>Resumed</h2><p>Session resumed!</p>`;
        this.updateContent(textContent);
      }
    });
  }

  getHtmlForWebview() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>ValidAlligator</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    padding: 10px;
                }
                #content {
                    line-height: 1.6;
                }
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    cursor: pointer;
                    border-radius: 2px;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <button id="startBtn">Start</button>
            <div id="content">
                <p>Click the Start button to load content...</p>
            </div>
            <script>
              const vscode = acquireVsCodeApi();
              let isPaused = false;
              const startBtn = document.getElementById('startBtn');
              
              startBtn.addEventListener('click', () => {
                  isPaused = !isPaused;
                  startBtn.textContent = isPaused ? 'Continue' : 'Pause';
                  vscode.postMessage({ 
                      command: isPaused ? 'pause' : 'continue' 
                  });
              });
            </script>
        </body>
        </html>
        `;
  }

  updateContent(text) {
    if (this.webview) {
      const htmlContent = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>ValidAlligator</title>
                    <style>
                        body {
                            font-family: var(--vscode-font-family);
                            color: var(--vscode-foreground);
                            padding: 10px;
                        }
                        #content {
                            line-height: 1.6;
                        }
                        button {
                            background-color: var(--vscode-button-background);
                            color: var(--vscode-button-foreground);
                            border: none;
                            padding: 8px 16px;
                            cursor: pointer;
                            border-radius: 2px;
                        }
                        button:hover {
                            background-color: var(--vscode-button-hoverBackground);
                        }
                    </style>
                </head>
                <body>
                    <button id="startBtn">Continue</button>
                    <div id="content">
                        ${text}
                    </div>
                    <script>
                      const vscode = acquireVsCodeApi();
                      let isPaused = true;
                      const startBtn = document.getElementById('startBtn');
                      
                      startBtn.addEventListener('click', () => {
                          isPaused = !isPaused;
                          startBtn.textContent = isPaused ? 'Continue' : 'Pause';
                          vscode.postMessage({ 
                              command: isPaused ? 'pause' : 'continue' 
                          });
                      });
                    </script>
                </body>
                </html>`;
      this.webview.html = htmlContent;
    }
  }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log("ValidAlligator is now active!");

  // Register sidebar provider
  sidebarProvider = new SidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("myVew", sidebarProvider),
  );
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
