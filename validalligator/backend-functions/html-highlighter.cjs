const vscode = require("vscode"); // This is the vscode api

const { getAllErrors, getError } = require("./error-storage.cjs");

const warningLines = new Map(); // Map<lineNum, decoration>

// Create decoration type once and reuse it
const highlightWarningStyle = vscode.window.createTextEditorDecorationType({
  isWholeLine: true,
  backgroundColor: "rgba(255, 0, 0, .3)",
  overviewRulerColor: "rgba(255, 0, 0, .3)",
  overviewRulerLane: vscode.OverviewRulerLane.Full,
  cursor: "pointer",
});

function highlightWarning(lineNum) {
  warningLines.set(lineNum, true);
}

function applyHighlights(editor) {
  if (!editor) {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) return;
    editor = activeEditor;
  }

  const decorations = [];

  for (const lineNum of warningLines.keys()) {
    const pos = new vscode.Position(lineNum - 1, 0);
    const endPos = new vscode.Position(lineNum - 1, 999);
    const range = new vscode.Range(pos, endPos);

    const error = getError(lineNum);
    const hoverMessage = error
      ? new vscode.MarkdownString(`**${error.title}**\n\n${error.message}`)
      : new vscode.MarkdownString("HTML Validation Error");

    decorations.push({
      range,
      hoverMessage,
    });
  }

  editor.setDecorations(highlightWarningStyle, decorations);
  warningLines.clear();
}

function getErrors() {
  return getAllErrors();
}

function clearHighlights() {
  warningLines.clear();
}

module.exports = {
  highlightWarning,
  applyHighlights,
  getErrors,
  clearHighlights,
};
