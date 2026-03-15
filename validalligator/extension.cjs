const {
  highlightWarning,
  applyHighlights,
  clearHighlights,
  getErrors,
} = require("./backend-functions/html-highlighter.cjs");
const {
  takeNote,
  updateDirectory,
  headerSelector,
  updateFileName,
  updateExtensionName,
} = require("./backend-functions/outputNote.cjs");
const { setAPIKey } = require("./backend-functions/apiKeyChange.cjs");
const validator = require("./backend-functions/validator");

const vscode = require("vscode");

let generatedPrompt;

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

    this.webview.onDidReceiveMessage((message) => {
      if (message.command === "pause") {
        this.isPaused = true;
        const textContent = `<h2>Paused</h2><p> Session paused. Click continue to resume.</p>`;
        clearHighlights();

        this.updateContent(textContent);
      }
      if (message.command === "continue") {
        this.isPaused = false;
        const textContent = `<h2>Resumed</h2><p>Session Live!</p> \n <p>Loading Suggestions...</p>`;
        this.updateContent(textContent);
      }
      if (message.command === "gotoError") {
        const editor = vscode.window.activeTextEditor;
        if (editor && message.lineNumber) {
          const line = message.lineNumber - 1;
          const range = new vscode.Range(line, 0, line, 0);
          editor.selection = new vscode.Selection(range.start, range.start);
          editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        }
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
                <p>Edit the document to Start!</p>
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
              })
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

  displayErrors() {
    const errors = getErrors();

    if (errors.length === 0) {
      this.updateContent(
        `<p style="color: var(--vscode-testing-message-error-decorationForeground);">✓ No errors found! Your HTML looks good.</p>`,
      );
      return;
    }

    let errorHTML = `<h3>🚨 Validation Issues (${errors.length})</h3>`;

    errors.forEach((error, index) => {
      errorHTML += `
        <div style="border-left: 3px solid var(--vscode-symbolIcon-errorForeground); padding: 12px; margin: 8px 0; background-color: rgba(255, 0, 0, 0.1); border-radius: 3px; cursor: pointer;" onclick="vscode.postMessage({ command: 'gotoError', lineNumber: ${error.lineNumber} })">
          <p><strong>Line ${error.lineNumber}: ${error.title}</strong></p>
          <p style="color: var(--vscode-editor-foreground); margin: 8px 0;">${error.message}</p>
          <p style="color: var(--vscode-descriptionForeground); font-size: 0.9em; margin: 4px 0;">Click to jump to line</p>
        </div>
      `;
    });

    this.updateContent(errorHTML);
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let togglestate = false;
  const { getAIResponse } = require("./backend-functions/ai.cjs");

  const aiToggle = vscode.commands.registerCommand(
    "validalligator.AItoggle",
    function () {
      togglestate = !togglestate;
      if (togglestate) {
        vscode.window.showInformationMessage("AI suggestions enabled!");
      } else {
        vscode.window.showInformationMessage("AI suggestions disabled!");
      }
    },
  );

  sidebarProvider = new SidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("myVew", sidebarProvider),
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
        `You are a debugging assistant. Respond in this exact format:\n\n**Issue:** [one sentence — what is wrong and why, under 20 words]\n\n\`\`\`\n[corrected code only — no explanations inside the block]\n\`\`\`\n\nFix only what is broken. Do not rewrite unrelated code. If multiple bugs exist, fix all in one block with a separate Issue: line for each.\n\n${selectedText}`,
      );
      generatedPrompt = analysis;
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
          "AI suggestions are disabled. Enable them to use suggestions",
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
        `You are a code mentor doing a quick code review. Respond in this exact format:\n\n**What went wrong:** [1–2 sentences explaining the root cause simply]\n\n**Why it matters:** [1 sentence on the consequence if left unfixed]\n\n**How to fix it:** [short prose walkthrough — guide them, don't just hand them code]\n\n\`\`\`\n[minimal illustrative example under 20 lines]\n\`\`\`\n\nMax 3 short paragraphs of prose. No extra headers or bullet lists.\n\n${selectedText}`,
      );
      generatedPrompt = analysis;
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
      generatedPrompt = analysis;
      sidebarProvider.updateContentWithMarkdown(analysis);
    },
  );

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "validalligator" is now active!',
  );

  // Original commands
  const disposable = vscode.commands.registerCommand(
    "validalligator.helloWorld",
    function () {
      vscode.window.showInformationMessage("Hello World from ValidAlligator!");
    },
  );

  const highlightWarn = vscode.commands.registerCommand(
    "validalligator.highlightWarnings",
    function () {
      highlightWarning(1);
      vscode.window.showInformationMessage("Suggestions are highlighted");
    },
  );

  const updateFolder = vscode.commands.registerCommand(
    "validalligator.updateDirectory",
    async () => {
      await updateDirectory();
    },
  );

  const testNote = vscode.commands.registerCommand(
    "validalligator.testNote",
    function () {
      let temp = takeNote(generatedPrompt);
      if (temp == -1) {
        vscode.window.showWarningMessage(
          'Must choose a directory using the command: "Change note.md Directory"',
        );
      } else if (temp == -2) {
        vscode.window.showWarningMessage(
          "Note you are trying to take is nothing",
        );
      } else {
        vscode.window.showInformationMessage("Note taken");
      }
    },
  );

  const hashtagHeaderSelect = vscode.commands.registerCommand(
    "validalligator.headerSelector",
    function () {
      headerSelector();
    },
  );

  const changeFileName = vscode.commands.registerCommand(
    "validalligator.updateFileName",
    async function () {
      await updateFileName();
    },
  );

  const changeExtensionName = vscode.commands.registerCommand(
    "validalligator.updateExtensionName",
    async function () {
      await updateExtensionName();
    },
  );

  const setAPI = vscode.commands.registerCommand(
    "validalligator.setAPIKey",
    async function () {
      await setAPIKey();
    },
  );

  context.subscriptions.push(
    disposable,
    highlightWarn,
    updateFolder,
    testNote,
    hashtagHeaderSelect,
    aiToggle,
    debugDisposable,
    suggestDisposable,
    refactorDisposable,
  );

  vscode.workspace.onDidChangeTextDocument((event) => {
    const editor = validator.html_validator(event);
    if (editor) {
      applyHighlights(editor);
      if (sidebarProvider) {
        sidebarProvider.displayErrors();
      }
    }
  });
}
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
