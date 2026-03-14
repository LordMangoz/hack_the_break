require("dotenv").config();

async function getAIResponse(prompt) {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({apiKey: "AIzaSyCQ7G6m1uGbJ4ldsFf7fyhVgD5IdJQe5xo"});

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return response.text;
}
module.exports = {
    getAIResponse,
};