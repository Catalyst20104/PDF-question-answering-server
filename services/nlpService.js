// // const axios = require("axios");

// // // Example of using OpenAI API for NLP processing
// // async function processQuestion(question, pdfContent, context) {

// //     try {
// //         const contextString = context
// //             .map((c) => `Q: ${c.question}\nA: ${c.answer}`)
// //             .join("\n");

// //         const prompt = `${contextString}\nContent: ${pdfContent}\n\nQ: ${question}\nA:`;

// //         const response = await axios.post(
// //             "https://api.openai.com/v1/chat/completions",
// //             {
// //                 model: "gpt-3.5-turbo", // or "gpt-4"
// //                 messages: [
// //                     { role: "system", content: "You are an assistant." },
// //                     { role: "user", content: "What is the capital of France?" },
// //                 ],
// //                 max_tokens: 50,
// //                 temperature: 0.7,
// //             },
// //             {
// //                 headers: {
// //                     "Content-Type": "application/json",
// //                     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// //                 },
// //             }
// //         );

// //         console.log("HI");
// //         return response.data.choices[0].text.trim();
// //     } catch (error) {
// //         console.error("Error in NLP processing:", error);
// //         throw new Error("NLP processing failed");
// //     }
// // }

// // module.exports = { processQuestion };
// require("dotenv").config();
// const axios = require("axios");

// async function processQuestion(question, pdfContent, context) {
//     const maxRetries = 5; // Maximum number of retries
//     let retries = 0;
//     let delay = 1000; // Initial delay in milliseconds (1 second)

//     while (retries < maxRetries) {
//         try {
//             // Prepare the prompt and send the request
//             const contextString = context
//                 .map((c) => `Q: ${c.question}\nA: ${c.answer}`)
//                 .join("\n");
//             const prompt = `${contextString}\nContent: ${pdfContent}\n\nQ: ${question}\nA:`;

//             const response = await axios.post(
//                 "https://api.openai.com/v1/chat/completions",
//                 {
//                     model: "gpt-3.5-turbo", // or "gpt-4"
//                     messages: [
//                         { role: "system", content: c.answer },
//                         { role: "user", content: c.question },
//                     ],
//                     max_tokens: 150,
//                     temperature: 0.7,
//                 },
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//                     },
//                 }
//             );

//             // Return the response content
//             return response.data.choices[0].message.content.trim();
//         } catch (error) {
//             if (error.response && error.response.status === 429) {
//                 // Handle rate limiting
//                 retries++;
//                 console.log(`Rate limited. Retrying in ${delay / 1000}s... (${retries}/${maxRetries})`);
//                 await new Promise((resolve) => setTimeout(resolve, delay));
//                 delay *= 2; // Exponential backoff
//             } else {
//                 // Handle other errors
//                 console.error("Error in NLP processing:", error);
//                 throw new Error("NLP processing failed");
//             }
//         }
//     }

//     throw new Error("Max retries reached. Could not complete the request.");
// }

// module.exports = { processQuestion };


require("dotenv").config();
const axios = require("axios");

async function processQuestion(question, pdfContent, context) {
    const maxRetries = 5; // Maximum number of retries
    let retries = 0;
    let delay = 1000; // Initial delay in milliseconds (1 second)

    while (retries < maxRetries) {
        try {
            // Prepare the prompt and send the request
            const contextMessages = context.map((c) => {
                return { role: "assistant", content: c.answer }; // Past assistant replies
            });

            const userMessage = { role: "user", content: question }; // Current user question
            const systemMessage = {
                role: "system",
                content: "You are an AI assistant helping with document-based Q&A.",
            };

            const messages = [systemMessage, ...contextMessages, userMessage];

            try {
                const response = await axios.post(
                    "https://api.openai.com/v1/chat/completions",
                    {
                        model: "gpt-3.5-turbo", // or "gpt-4"
                        messages,
                        max_tokens: 80,
                        temperature: 0.7,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                        },
                    }
                );
                return response.data.choices[0].message.content.trim();
            } catch (error) {
                console.error("Error details:", {
                    status: error.response?.status,
                    data: error.response?.data,
                    headers: error.response?.headers,
                });
                throw error; // Re-throw to handle retries or further processing
            }

        } catch (error) {
            if (error.response && error.response.status === 429) {
                // Handle rate limiting
                retries++;
                console.log(`Rate limited. Retrying in ${delay / 1000}s... (${retries}/${maxRetries})`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                // Handle other errors
                console.error("Error in NLP processing:", error);
                throw new Error("NLP processing failed");
            }
        }
    }

    throw new Error("Max retries reached. Could not complete the request.");
}

module.exports = { processQuestion };
