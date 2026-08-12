import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"

dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.json());

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY
// });

// const main = async () => {
//     const response = await ai.models.generateContent({
//         model: "gemini-3.6-flash",
//         contents: "Write a short poem about the beauty of nature."
//     })
//     console.log(response.text);
// }

// main();




// app.post("/get-ans", async (req, res) => {
//     const data = req.body;

//     const response = await ai.models.generateContent({
//         model: "gemini-3.6-flash",
//         contents: [
//             {
//                 role: "user",
//                 parts: [
//                     {
//                         text: data.prompt
//                     }
//                 ]
//             }
//         ],

//         config: {
//             systemInstruction:
//                 "You are a helpful assistant and your name is David."
//         }
//     })
//     console.log(response.text);
//     res.status(200).json({
//         message: "Request received successfully",
//         answer: response.text
//     });
// })



//--------LANG-CHAIN-----------------

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.6-flash",
    temperature: 0,
    maxRetries: 2,
    // other params...
})
app.post("/get-ans", async (req, res) => {
    const data = req.body;

    const response = await llm.invoke(data.prompt);
    return res.status(200).json({
        message: "Request received successfully",
        answer: response.content
    });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})