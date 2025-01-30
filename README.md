# Pdf-question-answering-server
This repository contains an Express.js server designed to handle PDF question-answering tasks. The server accepts PDF files, processes them to extract text, and utilizes a question-answering model to respond to user queries based on the content of the PDF.

# Features

- Upload PDF files and extract their text content for processing:
  - The application should store the PDF and extract text content for further processing.
- Real-time Q&A via WebSocket for uploaded documents:
  - The system retrieves relevant content from the PDF and generates real-time responses.
  - used OPENAI Api-Key for finding and preparing answers based on pdf. 
- Contextual follow-up questions within WebSocket sessions.
- Rate limiting to manage server load and prevent abuse:
  - Implemented rate limiting for API endpoints and WebSocket messages to manage server load and prevent abuse.
 
# Requirements
- Node.js,Express.js
- npm (Node package manager)
