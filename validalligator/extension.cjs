
const { highlightWarning } = require('./backend-functions/html-highlighter.cjs');
const {takeNote, updateDirectory, headerSelector } = require('./backend-functions/outputNote.cjs');
const vscode = require('vscode');

function activate(context) {

	console.log('Congratulations, your extension "validalligator" is now active!');


	const disposable = vscode.commands.registerCommand('validalligator.helloWorld', function () {

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

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
