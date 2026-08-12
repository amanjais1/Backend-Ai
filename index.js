import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { Annotation, StateGraph, START, END } from "@langchain/langgraph";

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

// app.post("/get-ans", async (req, res) => {
//     const data = req.body;

//     const response = await llm.invoke(data.prompt);
//     return res.status(200).json({
//         message: "Request received successfully",
//         answer: response.content
//     });
// })
//----------LANG-graph-----------------

const State = Annotation.Root({
    prompt: Annotation,
    aiMsg: Annotation,
});

const callLLM = async (state) => {
    const response = await llm.invoke([
        {
            role: "system",
            content: "you are a assistent and your name is chakarbangru . if you dont know answer then dont give icorrect answer"
        },
        {
            role: "human",
            content: state.prompt
        }
    ]);
    return { aiMsg: response.content }

}

const graph = new StateGraph(State)
    .addNode("agent", callLLM)
    .addEdge("__start__", "agent")
    .addEdge("agent", "__end__")
    .compile()


app.post("/get-ans", async (req, res) => {

    const { input } = req.body
    const response = await graph.invoke({ prompt: input })
    console.log(response)

    return res.status(200).json({
        "ai": response.aiMsg
    })
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})