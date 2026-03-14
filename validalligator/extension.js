const vscode = require("vscode");
const validator = require("./backend-functions/validator");

// This method is called when your extension is activated. Your extension is activated the very first time the command is executed

function activate(context) {
  console.log("Extention ran");

  const disposable = vscode.commands.registerCommand(
    "validalligator.helloWorld",
    function () {
      vscode.window.showInformationMessage("Hello World from ValidAlligator!");
    },
  );
  context.subscriptions.push(disposable);

  validator.html_validator();

  // context menu :for making the context menu work. have an option for activiate/deactive extention
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
