// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { highlightWarning } = require('./backend-functions/html-highlighter.cjs');
const {takeNote, updateDirectory, headerSelector } = require('./backend-functions/outputNote.cjs');
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "validalligator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('validalligator.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from ValidAlligator!');
	});

	const highlightWarn = vscode.commands.registerCommand("validalligator.highlightWarnings", function () {
		highlightWarning(1);
		vscode.window.showInformationMessage('Warnings are highlighted');
})

	const updateFolder = vscode.commands.registerCommand("validalligator.updateDirectory", async () => {
		await updateDirectory();
})

	const testNote = vscode.commands.registerCommand("validalligator.testNote", function () {
		if (takeNote("hello") == -1)
		{
			vscode.window.showWarningMessage("Must choose a directory using the command: \"Change note.md Directory\"");
		}

		else
		{
			vscode.window.showInformationMessage('Note taken');		
		}
})

	const hashtagHeaderSelect = vscode.commands.registerCommand("validalligator.headerSelector", function () {
		headerSelector();
})

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
