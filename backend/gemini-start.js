const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require('readline');

// Replace this with your actual API key
const genAI = new GoogleGenerativeAI("AIzaSyCz10M2_0ZLFN51QMgecCEdzb9sh9tXBaw");

// Use Gemini Pro for text tasks
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Set up readline interface for asking questions interactively
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function queryGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

// List of 10 mood-related questions
const questions = [
  "How are you feeling today?",
  "Did something happen today that made you happy?",
  "Are you feeling more energetic or relaxed right now?",
  "Do you feel like you're in a good mood or need some cheering up?",
  "What was the last thing that made you laugh?",
  "Are you feeling social or more in the mood for alone time?",
  "How do you usually feel at the end of a workday?",
  "What's your current favorite activity?",
  "Do you prefer something calm or something exciting today?",
  "Are you feeling optimistic or a bit down today?"
];

let responses = [];

async function askQuestion(index) {
  if (index < questions.length) {
    rl.question(`${questions[index]} `, async (answer) => {
      responses.push(answer);
      // Recursively ask the next question
      await askQuestion(index + 1);  // Ensure async flow here
    });
  } else {
    // All questions are asked, now generate the mood and genre recommendations
    rl.close();
    await generateGenreRecommendations();  // Ensure it's called inside an async function
  }
}

async function generateGenreRecommendations() {
  try {
    // Combine responses into a prompt for generating mood analysis
    const moodPrompt = `Based on these answers, determine the person's mood in single words and recommend appropriate movie genres single words:\n${responses.join("\n")}`;
    const moodAnalysis = await queryGemini(moodPrompt);

    console.log("\nMood Analysis and Genre Recommendations:");
    console.log(moodAnalysis);
  } catch (error) {
    console.error("Error generating mood and genre recommendations:", error.message);
  }
}

// Start asking questions
async function start() {
  await askQuestion(0);  // Call the question asking function within an async function
}

start();  // Start the async process
