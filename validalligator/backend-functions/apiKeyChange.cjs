const vscode = require('vscode');

const SECRET_KEY = 'my_extension_api_key';

/**
 * Prompts the user and saves the API key securely.
 * @param {vscode.ExtensionContext} context 
 */
async function setAPIKey(context) {
    const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your API Key',
        placeHolder: 'Your API Key here...',
        ignoreFocusOut: true,
        password: true 
    });

    if (!apiKey) {
        vscode.window.showWarningMessage('API Key input was canceled or empty.');
        return;
    }

    try {
        await context.secrets.store(SECRET_KEY, apiKey);
        vscode.window.showInformationMessage('API Key securely saved.');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to save API Key: ${error.message}`);
    }
}

/**
 * Retrieves the saved API key.
 * @param {vscode.ExtensionContext} context 
 * @returns {Promise<string | undefined>}
 */
async function getAPIKey(context) {
    return await context.secrets.get(SECRET_KEY);
}

module.exports = {
    setAPIKey,
    getAPIKey
};