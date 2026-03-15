const fs = require('fs');
const vscode = require('vscode');

const boilerplate = "GEMINI_API_KEY="
let apiKey;

async function setAPIKey()
{
    const apiKeyOptions =
    {
        password: true
    }
    apiKey = vscode.window.showInputBox(apiKeyOptions);

    fs.writeFileSync("../.env", boilerplate + apiKey);
}

module.exports =
{
    setAPIKey
};