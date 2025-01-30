const cohere = require('cohere-ai');
cohere.init('pDMcMYoUdVjEobMn8kNgjj4KIME06ouMVuzMvV5l'); // Replace with your Cohere API key

async function processQuestion(question, content, context) {
    try {
        // Combine context, content, and question into a coherent prompt
        const prompt = `
You are an AI assistant that answers questions based on provided content and previous conversations. Use the following information to answer questions:

Content:
${content}

Context (Previous Questions and Answers):
${context.map((c) => `Q: ${c.question}\nA: ${c.answer}`).join("\n")}

Q: ${question}
A:`;

        // Make the request to Cohere API
        const response = await cohere.generate({
            model: 'command-xlarge-nightly', // Choose the appropriate model
            prompt: prompt,
            max_tokens: 150,
            temperature: 0.7,
            k: 0,
            p: 1.0,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        // Extract and return the generated answer
        return response.body.generations[0].text.trim();
    } catch (error) {
        console.error("Error processing question:", error);
        throw new Error("Failed to process the question using Cohere AI.");
    }
}

// Example usage
(async () => {
    const content = "Paris is the capital of France. It is known for its art, gastronomy, and culture.";
    const context = [
        { question: "What is the capital of France?", answer: "The capital of France is Paris." },
    ];
    const question = "What is Paris famous for?";

    try {
        const answer = await processQuestion(question, content, context);
        console.log("Answer:", answer);
    } catch (error) {
        console.error(error.message);
    }
})();
