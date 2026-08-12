import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { Annotation, MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";

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
const tool = new TavilySearch({
    maxResults: 5,
    topic: "general",
});

const checkPointer = new MemorySaver()


const tools = [tool]
const toolNode = new ToolNode(tools)

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.6-flash",
    temperature: 0,
    maxRetries: 2,
    // other params...
}).bindTools(tools)

// app.post("/get-ans", async (req, res) => {
//     const data = req.body;

//     const response = await llm.invoke(data.prompt);
//     return res.status(200).json({
//         message: "Request received successfully",
//         answer: response.content
//     });
// })
//----------LANG-graph-----------------


const callLLM = async (state) => {
    console.log("state:", state)

    const response = await llm.invoke([
        {
            role: "system",
            content: `You are Chakarbangru AI assistant

Use conversation memory first.

Only use tools when the answer requires
external real-time information like:
weather, news, web search, stock prices etc.

Do NOT call tools for simple conversation,
memory-based questions, greetings,
or personal context`
        },
        ...state.messages
    ])

    return { messages: [response] }
}

const shouldContinue = async (state) => {
    const lastMessage = state.messages[state.messages.length - 1]
    if (lastMessage.tool_calls.length > 0) {
        return "tools"
    } else {
        return "__end__"
    }
}

const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callLLM)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .compile({ checkpointer: checkPointer })


app.post("/get-ans", async (req, res) => {

    const { input } = req.body
    const response = await graph.invoke(
        {
            messages: [
                {
                    role: "user",
                    content: input
                }
            ]
        },
        { configurable: { thread_id: "user123" } }

    )
    console.log(response.messages)

    return res.status(200).json({ "ai:": response.messages[response.messages.length - 1].content })
})


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})