// const express = require("express");
// const multer = require("multer");
// const pdfParse = require("pdf-parse");
// const fs = require("fs/promises");
// const http = require("http");
// const WebSocket = require("ws");
// const app = express();
// const PORT = 3000;

// // Configure Multer for file uploads
// const upload = multer({ dest: "uploads/" });
// // Middleware to parse JSON request body
// app.use(express.json());

// // HTTP POST route for receiving data
// app.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: "No file uploaded" });
//         }

//         if (req.file.mimetype !== "application/pdf") {
//             // Delete the file if it's not a PDF
//             await fs.unlink(req.file.path);
//             return res.status(400).json({ error: "Only PDF files are allowed" });
//         }

//         // Read the uploaded file
//         const pdfBuffer = await fs.readFile(req.file.path);

//         // Extract text from the PDF
//         const data = await pdfParse(pdfBuffer);

//         // Delete the file after processing
//         await fs.unlink(req.file.path);

//         // Return extracted text
//         res.status(200).json({
//             message: "PDF processed successfully",
//             text: data.text,
//         });
//     } catch (error) {
//         console.error("Error processing PDF:", error);
//         res.status(500).json({ error: "An error occurred while processing the PDF" });
//     }
// });

// // Create an HTTP server using Express
// const server = http.createServer(app);

// // Create a WebSocket server that shares the same HTTP server
// const wss = new WebSocket.Server({ server });

// // Handle WebSocket connections
// wss.on('connection', (ws) => {
//     console.log("WebSocket connection established");
//     ws.on("message", async (message) => {
//         try {
//             const { sessionId, question } = JSON.parse(message);

//             if (!sessions[sessionId]) {
//                 ws.send(
//                     JSON.stringify({
//                         error: "Invalid session. Please upload a PDF first.",
//                     })
//                 );
//                 return;
//             }

//             // Retrieve PDF content and previous context
//             const session = sessions[sessionId];
//             const { content, context } = session;

//             // Process the question using an NLP service
//             const answer = await processQuestion(question, content, context);

//             // Update session context with the question and answer
//             context.push({ question, answer });

//             // Send the answer back to the client
//             ws.send(
//                 JSON.stringify({
//                     question,
//                     answer,
//                 })
//             );
//         } catch (error) {
//             console.error("Error processing WebSocket message:", error);
//             ws.send(
//                 JSON.stringify({
//                     error: "An error occurred while processing your question.",
//                 })
//             );
//         }
//     });

//     ws.on("close", () => {
//         console.log("WebSocket connection closed");
//     });
// });

// // Start the server on port 3000
// server.listen(3000, () => {
//     console.log('Express and WebSocket server running on http://localhost:3000');
// });

const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs/promises");
const http = require("http");
const WebSocket = require("ws");
const app = express();
const PORT = 3000;

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });
app.use(express.json());

app.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        if (req.file.mimetype !== "application/pdf") {
            // Delete the file if it's not a PDF
            await fs.unlink(req.file.path);
            return res.status(400).json({ error: "Only PDF files are allowed" });
        }

        // Read the uploaded file
        const pdfBuffer = await fs.readFile(req.file.path);

        // Extract text from the PDF
        const data = await pdfParse(pdfBuffer);

        // Delete the file after processing
        await fs.unlink(req.file.path);

        // Return extracted text
        res.status(200).json({
            message: "PDF processed successfully",
            text: data.text,
        });
    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({ error: "An error occurred while processing the PDF" });
    }
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    console.log("WebSocket connection established");
    ws.on("message", async (message) => {
        try {
            const { sessionId, question } = JSON.parse(message);

            if (!sessions[sessionId]) {
                ws.send(
                    JSON.stringify({
                        error: "Invalid session. Please upload a PDF first.",
                    })
                );
                return;
            }

            // Retrieve PDF content and previous context
            const session = sessions[sessionId];
            const { content, context } = session;

            // Process the question using an NLP service
            const answer = await processQuestion(question, content, context);

            // Update session context with the question and answer
            context.push({ question, answer });

            // Send the answer back to the client
            ws.send(
                JSON.stringify({
                    question,
                    answer,
                })
            );
        } catch (error) {
            console.error("Error processing WebSocket message:", error);
            ws.send(
                JSON.stringify({
                    error: "An error occurred while processing your question.",
                })
            );
        }
    });

    ws.on("close", () => {
        console.log("WebSocket connection closed");
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
