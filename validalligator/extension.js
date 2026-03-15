const vscode = require("vscode");
const validator = require("./backend-functions/validator");

// This method is called when your extension is activated. Your extension is activated the very first time the command is executed

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
        const textContent = `<h2>Resumed</h2><p>Session resumed!</p> \n <p>Here is some new content after resuming...</p>`;
        this.updateContent(textContent);
      }
      if (message.command === "analyze") {
        this.executeAnalysis();
      }
    });
  }

  getHtmlForWebview(webview) {
    const startIconUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "start.svg"),
    );
    const pauseIconUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "pause.svg"),
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
                    margin-right: 8px;
                }
                button:hover:not(:disabled) {
                    background-color: var(--vscode-button-hoverBackground);
                }
                button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
				img {
					width: 16px;
					height: 16px;
				}
            </style>
        </head>
        <body>
            <button id="startBtn"><img src="${startIconUri}" alt="Start"></button>
            <button id="analyzeBtn">Analyze Text</button>
            <div id="content">
                <p>Click the Start button to load content...</p>
            </div>
            <script>
              const vscode = acquireVsCodeApi();
              let isPaused = true;
              const startBtn = document.getElementById('startBtn');
              const analyzeBtn = document.getElementById('analyzeBtn');
              
              startBtn.addEventListener('click', () => {
                  isPaused = !isPaused;
                  startBtn.innerHTML = isPaused ? \`<img src="${startIconUri}" alt="Start">\` : \`<img src="${pauseIconUri}" alt="Pause">\`;
                  analyzeBtn.disabled = isPaused;
                  vscode.postMessage({ 
                      command: isPaused ? 'pause' : 'continue' 
                  });
              });

              analyzeBtn.addEventListener('click', () => {
                  if (!isPaused) {
                      vscode.postMessage({ command: 'analyze' });
                  }
              });

              analyzeBtn.disabled = isPaused;

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

  async executeAnalysis() {
    const { getAIResponse } = require("./ai");
    const selectedText = await vscode.window.activeTextEditor?.document.getText(
      vscode.window.activeTextEditor.selection,
    );

    if (!selectedText) {
      this.updateContent(
        `<p>No text selected. Please select some text to analyze.</p>`,
      );
      return;
    }

    this.updateContent(`<p>Analyzing...</p>`);

    const analysis = await getAIResponse(
      `Analyze this code and provide suggestions:\n\n${selectedText}`,
    );
    this.updateContent(`<h3>Analysis Results</h3><p>${analysis}</p>`);
  }
}

function activate(context) {
  console.log("ValidAlligator is now active!");
  const { getAIResponse } = require("./ai");

  async function main() {
    const reply = await getAIResponse("Explain recursion in one sentence");
    const aiChannel = vscode.window.createOutputChannel("AI Response");
    aiChannel.appendLine(reply);
    aiChannel.show();
  }

  vscode.commands.registerCommand("validalligator.AItoggle", function () {
    vscode.window.showInformationMessage("AI suggestions toggled!");
    main();
  });
  sidebarProvider = new SidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("myVew", sidebarProvider),
  );
  vscode.window.showInformationMessage("activated");

  const disposable = vscode.commands.registerCommand(
    "validalligator.helloWorld",
    function () {
      vscode.window.showInformationMessage("Hello World from ValidAlligator!");
    },
  );

  const analyzeDisposable = vscode.commands.registerCommand(
    "validalligator.analyzeText",
    function () {
      sidebarProvider.executeAnalysis();
    },
  );

  context.subscriptions.push(disposable, analyzeDisposable);
  console.log("a");
  validator.html_validator();
  vscode.workspace.onDidChangeTextDocument(() => {
    validator.html_validator();
  });

  // context menu :for making the context menu work. have an option for activiate/deactive extention
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
