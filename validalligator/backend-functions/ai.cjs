const path = require("path");
const dotenv = require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

async function getAIResponse(prompt) {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}
module.exports = {
  getAIResponse,
};
