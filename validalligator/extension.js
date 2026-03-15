const vscode = require("vscode");
const validator = require("./backend-functions/validator");

// This method is called when your extension is activated. Your extension is activated the very first time the command is executed

function activate(context) {
  vscode.window.showInformationMessage("activated activate");

  const disposable = vscode.commands.registerCommand(
    "validalligator.helloWorld",
    function () {
      vscode.window.showInformationMessage("Hello World from ValidAlligator!");
    },
  );
  context.subscriptions.push(disposable);

  vscode.workspace.onDidChangeTextDocument((event) => {
    // make the nvalidator work based on input command initally, run below line based on that
    validator.html_validator(event);
  });

  // context menu :for making the context menu work. have an option for activiate/deactive extention
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
