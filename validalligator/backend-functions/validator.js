// imports vs extention api
const vscode = require("vscode");

// need more conditionals for it running.
function html_validator() {
  console.log("accessed html");
  const editor = vscode.window.activeTextEditor; //could be not open ->
  if (!editor) return;

  vscode.workspace.onDidChangeTextDocument((event) => {
    const document = event.document;
    const text = document.getText();
    validate(text);
  });
}

/**
 * contains the validation logic
 */
function validate(text) {
  if (!text) return;

  if (text.includes("s")) {
    console.log("s detected");
  }

  console.log("no s detected");

  // parse and check for a test case (a form without whatever) / maybe just activate the highlight function.
  // parse through while checking for things in our list without a container div
}

module.exports = { html_validator };
