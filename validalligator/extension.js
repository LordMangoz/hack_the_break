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

  resolveWebviewView(webviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
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

  getHtmlForWebview(webview) {
	const startIconUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this.context.extensionUri, 'media', 'start.svg')
    );
	const pauseIconUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this.context.extensionUri, 'media', 'pause.svg')
    );
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
				img {
					width: 16px;
					height: 16px;
				}
            </style>
        </head>
        <body>
            <button id="startBtn"><img src="${startIconUri}" alt="Start"></button>
            <div id="content">
                <p>Click the Start button to load content...</p>
            </div>
            <script>
              const vscode = acquireVsCodeApi();
              let isPaused = true;
              const startBtn = document.getElementById('startBtn');
              
              startBtn.addEventListener('click', () => {
                  isPaused = !isPaused;
                  startBtn.innerHTML = isPaused ? \`<img src="${startIconUri}" alt="Start">\` : \`<img src="${pauseIconUri}" alt="Pause">\`;
                  vscode.postMessage({ 
                      command: isPaused ? 'pause' : 'continue' 
                  });
              });

              // Listen for updates from extension
              window.addEventListener('message', (event) => {
                const message = event.data;
                if (message.command === 'updateContent') {
                  document.getElementById('content').innerHTML = message.text;
                }
              });
            </script>
        </body>
        </html>
        `;
  }

  updateContent(text) {
    if (this.webview) {
      this.webview.postMessage({
        command: "updateContent",
        text: text,
      });
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

