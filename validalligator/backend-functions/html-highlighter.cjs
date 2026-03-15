const vscode = require("vscode"); // This is the vscode api

const highlightWarningStyle = vscode.window.createTextEditorDecorationType({
  isWholeLine: true,
  backgroundColor: "rgba(255, 0, 0, .3)",
  overviewRulerColor: "rgba(255, 0, 0, .3)",
  overviewRulerLane: vscode.OverviewRulerLane.Full,
});

const warningLines = new Set();
const { getAllErrors } = require("./error-storage.cjs");

function highlightWarning(lineNum) {
  warningLines.add(lineNum);
}

function applyHighlights() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) return;

  const ranges = [];

  for (const line of warningLines) {
    const pos = new vscode.Position(line - 1, 0);
    const range = new vscode.Range(pos, pos);
    ranges.push(range);
  }

  editor.setDecorations(highlightWarningStyle, ranges);

  warningLines.clear();
}

function getErrors() {
  return getAllErrors();
}

module.exports = {
  highlightWarning,
  applyHighlights,
  getErrors,
};
