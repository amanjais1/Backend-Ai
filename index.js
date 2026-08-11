import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// const main = async () => {
//     const response = await ai.models.generateContent({
//         model: "gemini-3.6-flash",
//         contents: "Write a short poem about the beauty of nature."
//     })
//     console.log(response.text);
// }

// main();




app.post("/get-ans", async (req, res) => {
    const data = req.body;

    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: data.prompt
    })
    console.log(response.text);
    res.status(200).json({ message: "Request received successfully" });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})