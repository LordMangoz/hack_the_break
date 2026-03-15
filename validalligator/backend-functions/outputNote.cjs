const vscode = require('vscode'); // This is the vscode api
const fs = require('fs');
const path = require('path');

let fileDirectory = null;

let fileName = "notes";

let extensionName = ".md";

let hashtagHeader = '# ';

/**
 * @param {string | Uint8Array<ArrayBufferLike>} prompt
 */
function takeNote(prompt)
{
    if (prompt == undefined || prompt.length == 0)
    {
        console.error("Nothing to take note of");
        return -2   ;
    }

    if (fileDirectory == null)
    {
        console.error("Missing directory to save note.md");
        return -1;
    }

    const toAppend = path.join(fileDirectory, fileName + extensionName); 
    let timestamp; 

    if (!fs.existsSync(toAppend) || fs.statSync(toAppend).size === 0) // 0 bytes
    {
        console.log(`note.md is empty or not existing. Created one`);
        timestamp = hashtagHeader + new Date().toLocaleString() + '\n'
    }

    else
    {
        timestamp = '\n\n' + hashtagHeader + + new Date().toLocaleString() + '\n'; 
    }

        try
        {

            fs.appendFileSync(toAppend, timestamp + prompt, 'utf-8');

            console.log(`Note appended to notes.md. Saved in ${toAppend}`);
        }

        catch (err)
        {
            console.error("error", err);
        }
    }

async function updateFileName()
{
    const fileNameOptions =
    {
        placeHolder: "Enter file name",

        validateInput: (value) => {
            const regex = /^[^\\/:*?"<>|.\s]+$/;
            if (!regex.test(value)) {
                return 'Invalid file name';  
            }
            return undefined;
          }
    }

    fileName = await vscode.window.showInputBox(fileNameOptions);
    vscode.window.showInformationMessage(`New file name set: ${fileName}` )
}

async function updateExtensionName()
{
    const extensionNameOptions =
    {
        placeHolder: "Enter file name",

        validateInput: (value) => {
            const regex = /^[a-z0-9]+$/;
            if (!regex.test(value)) {
                return 'Invalid file extension';  
            }
            return undefined;
          }
    }

    extensionName = await vscode.window.showInputBox(extensionNameOptions);
    vscode.window.showInformationMessage(`New extension name set: ${extensionName}` )
}




async function updateDirectory()
{
    const parameters =
    {
        canSelectMany: false,
        canSelectFolders: true,
        canSelectFiles: false,
        openLabel: "Select Directory for Notes"
    }

    const chosenFolder = await vscode.window.showOpenDialog(parameters);

    if (chosenFolder && chosenFolder.length > 0)
    {
        fileDirectory = chosenFolder[0].fsPath;

        console.log(`Successfuly updated directory to: ${fileDirectory}` + "\\");
        vscode.window.showInformationMessage(`Successfuly updated directory to: ${fileDirectory}` + "\\");
    }

    else
    {
        vscode.window.showInformationMessage(`No directory chosen`);

        return null;
    }
}

async function headerSelector()
{
    const headerChoices = ['0','1','2','3','4','5','6'];
    const headerOptions =
    {
        placeHolder: "Select number of \'#\'"
    }
    const chosen = await vscode.window.showQuickPick(headerChoices, headerOptions
    );

    const chosenInt = parseInt(chosen, 10);

    switch (chosenInt)
    {
        case 0: hashtagHeader = '';
        break;
        case 1: hashtagHeader = '# ';
        break;
        case 2: hashtagHeader = '## ';
        break;
        case 3: hashtagHeader = '### ';
        break;
        case 4: hashtagHeader = '#### ';
        break;
        case 5: hashtagHeader = '##### ';
        break;
        case 6: hashtagHeader = '###### ';
        break;
    }

    vscode.window.showInformationMessage(`Number of hashtags updated to: ${hashtagHeader}`);
}

module.exports =  {
    takeNote,
    updateDirectory,
    headerSelector,
    updateFileName,
    updateExtensionName
};

