const path = require("path");
const dotenv = require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { getAPIKey } = require("./apiKeyChange.cjs");
const vscode = require("vscode");


async function getAIResponse(context, prompt) {
    // Step 1: Retrieve the API key from SecretStorage
    const apiKey = await getAPIKey(context);

    // Step 2: Validate the key
    if (!apiKey)
    {
        vscode.window.showErrorMessage('Gemini API Key is missing. Please configure it using the Set API Key command.');
        throw new Error('API Key not found');
    }

    try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;
        
    } catch (error) {
        vscode.window.showErrorMessage(`AI request failed: ${error.message}`);
        throw error;
    }
}
module.exports = {
    getAIResponse,
};