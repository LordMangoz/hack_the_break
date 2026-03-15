const vscode = require("vscode");
const validator = require("./backend-functions/validator");

// This method is called when your extension is activated. Your extension is activated the very first time the command is executed

let sidebarProvider;

class SidebarProvider {
  constructor(context) {
    this.context = context;
    this._onDidChange = new vscode.EventEmitter();
    this.onDidChange = this._onDidChange.event;
    this.isPaused = true;
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
        this.isPaused = true;
        const textContent = `<h2>Paused</h2><p>Session paused. Click continue to resume.</p>`;
        this.updateContent(textContent);
      }
      if (message.command === "continue") {
        this.isPaused = false;
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
                #content h1, #content h2, #content h3, #content h4 {
                    margin-top: 16px;
                    margin-bottom: 8px;
                    font-weight: 600;
                }
                #content code {
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 0.9em;
                }
                #content pre {
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    padding: 12px;
                    border-radius: 5px;
                    overflow-x: auto;
                    margin: 8px 0;
                    border-left: 3px solid var(--vscode-textBlockQuote-border);
                }
                #content pre code {
                    background-color: transparent;
                    padding: 0;
                    color: inherit;
                }
                #content ul, #content ol {
                    margin: 8px 0;
                    padding-left: 24px;
                }
                #content li {
                    margin: 4px 0;
                }
                #content blockquote {
                    border-left: 3px solid var(--vscode-textBlockQuote-border);
                    color: var(--vscode-textBlockQuote-foreground);
                    padding-left: 12px;
                    margin: 8px 0;
                }
                #content strong {
                    font-weight: 600;
                }
                #content em {
                    font-style: italic;
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
                  vscode.postMessage({ 
                      command: isPaused ? 'pause' : 'continue' 
                  });
              })
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

  updateContentWithMarkdown(markdownText) {
    import("marked").then(({ marked }) => {
      const html = marked(markdownText);
      this.updateContent(html);
    });
  }

  async executeAnalysis() {
    const { getAIResponse } = require("./ai");
    const selectedText = await vscode.window.activeTextEditor?.document.getText(
      vscode.window.activeTextEditor?.selection,
    );

    if (!selectedText) {
      this.updateContent(
        `<p>No text selected. Please select some text to analyze.</p>`,
      );
      return;
    }

    this.updateContent(`<p>Analyzing...</p>`);

    // query
    const analysis = await getAIResponse(
      `Recommend any suggestions with coding examples:\n\n${selectedText}`,
    );
    this.updateContentWithMarkdown(analysis);
  }
}

function activate(context) {
  console.log("ValidAlligator is now active!");
  let togglestate = false;
  const { getAIResponse } = require("./ai");

  vscode.commands.registerCommand("validalligator.AItoggle", function () {
    togglestate = !togglestate;
    if (togglestate) {
      vscode.window.showInformationMessage("AI suggestions enabled!");
    } else {
      vscode.window.showInformationMessage("AI suggestions disabled!");
    }
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

  const debugDisposable = vscode.commands.registerCommand(
    "validalligator.debuggingText",
    async function () {
      if (sidebarProvider.isPaused) {
        vscode.window.showWarningMessage("Resume the session to use debugging");
        return;
      }
      if (!togglestate) {
        vscode.window.showWarningMessage(
          "AI suggestions are disabled. Enable them to use debugging",
        );
        return;
      }
      const selectedText = vscode.window.activeTextEditor?.document.getText(
        vscode.window.activeTextEditor?.selection,
      );
      if (!selectedText) {
        vscode.window.showWarningMessage("Please select text to debug");
        return;
      }
      sidebarProvider.updateContent(`<p>Analyzing for debugging issues...</p>`);
      const analysis = await getAIResponse(
        `You are a debugging assistant. Respond in this exact format:

        **Issue:** [one sentence — what is wrong and why, under 20 words]

        \`\`\`
        [corrected code only — no explanations inside the block]
        \`\`\`

        Fix only what is broken. Do not rewrite unrelated code. If multiple bugs exist, fix all in one block with a separate Issue: line for each.\n\n${selectedText}`,
      );
      sidebarProvider.updateContentWithMarkdown(analysis);
    },
  );

  const suggestDisposable = vscode.commands.registerCommand(
    "validalligator.suggestText",
    async function () {
      if (sidebarProvider.isPaused) {
        vscode.window.showWarningMessage(
          "Resume the session to use suggestions",
        );
        return;
      }
      if (!togglestate) {
        vscode.window.showWarningMessage(
          "AI suggestions are disabled. Enable them to use debugging",
        );
        return;
      }
      const selectedText = vscode.window.activeTextEditor?.document.getText(
        vscode.window.activeTextEditor?.selection,
      );
      if (!selectedText) {
        vscode.window.showWarningMessage("Please select text for suggestions");
        return;
      }
      sidebarProvider.updateContent(`<p>Generating suggestions...</p>`);
      const analysis = await getAIResponse(
        `You are a code mentor doing a quick code review. Respond in this exact format:

        **What went wrong:** [1–2 sentences explaining the root cause simply]

        **Why it matters:** [1 sentence on the consequence if left unfixed]

        **How to fix it:** [short prose walkthrough — guide them, don't just hand them code]

        \`\`\`
        [minimal illustrative example under 20 lines]
        \`\`\`

        Max 3 short paragraphs of prose. No extra headers or bullet lists.\n\n${selectedText}`,
      );
      sidebarProvider.updateContentWithMarkdown(analysis);
    },
  );

  const refactorDisposable = vscode.commands.registerCommand(
    "validalligator.refactorText",
    async function () {
      if (sidebarProvider.isPaused) {
        vscode.window.showWarningMessage(
          "Resume the session to use refactoring",
        );
        return;
      }
      if (!togglestate) {
        vscode.window.showWarningMessage(
          "AI suggestions are disabled. Enable them to use refactoring",
        );
        return;
      }
      const selectedText = vscode.window.activeTextEditor?.document.getText(
        vscode.window.activeTextEditor?.selection,
      );
      if (!selectedText) {
        vscode.window.showWarningMessage("Please select text to refactor");
        return;
      }
      sidebarProvider.updateContent(
        `<p>Analyzing for refactoring opportunities...</p>`,
      );
      const analysis = await getAIResponse(
        `You are a refactoring assistant. Return only the refactored code in a single code block — nothing before or after it. Use short inline comments to mark what changed and why. Preserve the original logic and public API. Do not add new features or change behaviour.\n\n${selectedText}`,
      );
      sidebarProvider.updateContentWithMarkdown(analysis);
    },
  );

  context.subscriptions.push(
    disposable,
    analyzeDisposable,
    debugDisposable,
    suggestDisposable,
    refactorDisposable,
  );
  console.log("a");
  validator.html_validator();

  vscode.workspace.onDidChangeTextDocument((event) => {
    validator.html_validator(event);
  });
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
