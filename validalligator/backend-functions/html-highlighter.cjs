const vscode = require('vscode'); // This is the vscode api

const highlightWarningStyle = vscode.window.createTextEditorDecorationType
({
    isWholeLine: true,
    backgroundColor: "rgba(255, 0, 0, .3)",
    overviewRulerColor: "rgba(255, 0, 0, .3)",
    overviewRulerLane: vscode.OverviewRulerLane.Full
})

/**
 * @param {number} lineNum
 */
function highlightWarning(lineNum)
{
    const problemLine = new vscode.Position(lineNum - 1, 0 /*this number does not matter*/) 
    const editor = vscode.window.activeTextEditor;

    if (!editor)
        {
            return
        }
        
    const lineToHighlight = new vscode.Range(problemLine, problemLine);
    const uri = editor.document.uri.toString();

    editor.setDecorations(highlightWarningStyle, [lineToHighlight])
}

function clearWarningHighlights() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    // Passing an empty array clears all decorations associated with this style
    editor.setDecorations(highlightWarningStyle, []);
}

module.exports =  {
    highlightWarning,
};