require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyCz10M2_0ZLFN51QMgecCEdzb9sh9tXBaw");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let history = [];
let currentQuestionCount = 0;
const MAX_QUESTIONS = 5;
const usedQuestions = new Set();

async function getFirstOpenQuestion() {
  const question = "How are you feeling right now in your own words?";
  history.push({ question, answer: "" });
  usedQuestions.add(question);
  return { question, type: "text" };
}

async function getNextMCQQuestion() {
  const context = history.map((entry, idx) => `Q${idx + 1}: ${entry.question}\nA${idx + 1}: ${entry.answer}`).join('\n');
  const prompt = `
You're a mental wellness assistant. Based on the following conversation history, generate a NEW,UNIQUE and SHORT multiple-choice question with SHORT options that helps assess the user's mood more deeply.

DO NOT REPEAT any previously asked questions.
Use this format only:
{
  "question": "Your question here",
  "options": ["Option1", "Option2", "Option3", "Option4"]
}

Here are the previous questions:
${history.map((h, i) => `Q${i + 1}: ${h.question}`).join('\n')}

Conversation history:
${context}
`;

  try {
    const result = await model.generateContent(prompt);
    let text = (await result.response).text().trim();
    if (text.startsWith("```")) {
      text = text.replace(/```json|```/g, "").trim();
    }
    const parsed = JSON.parse(text);

    // Prevent repetition explicitly
    if (usedQuestions.has(parsed.question)) {
      throw new Error("Repeated question detected.");
    }

    usedQuestions.add(parsed.question);
    history.push({ question: parsed.question, answer: "" });
    return { question: parsed.question, options: parsed.options, type: "mcq" };
  } catch (err) {
    console.error("MCQ generation failed:", err);
    const fallback = {
      question: "Which of these best describes your current state?",
      options: ["Happy", "Stressed", "Tired", "Content"],
      type: "mcq"
    };
    if (!usedQuestions.has(fallback.question)) {
      usedQuestions.add(fallback.question);
      history.push({ question: fallback.question, answer: "" });
    }
    return fallback;
  }
}

async function generateProbabilities() {
  const answersText = history.map((entry, i) => `Q${i + 1}: ${entry.question}\nA${i + 1}: ${entry.answer}`).join('\n');

  const prompt = `
Based on the following Q&A, estimate two sets of probabilities (0-100%) for:

1. Mood: ["Happy", "Sad", "Angry", "Calm", "Anxious", "Excited"]
and
2. Genre: ["Action", "Animation", "Comedy", "Crime", "Documentary", "Drama", "European", "Family", "Fantasy", "History", "Horror", "Music", "Reality", "Romance", "SciFi", "Sport", "Thriller", "War", "Western"]

Respond ONLY in this format:
{
  "mood": {
    "Happy": %, "Sad": %, ...
  },
  "genre": {
    "Action": %, "Animation": %, ...
  }
}

Data:
${answersText}
`;

  try {
    const result = await model.generateContent(prompt);
    let text = (await result.response).text().trim();
    if (text.startsWith("```")) {
      text = text.replace(/```json|```/g, "").trim();
    }
    return JSON.parse(text);
  } catch (err) {
    console.error("Probability generation failed:", err);
    return { mood: {}, genre: {} };
  }
}

// New route to get movie description based on mood and genre
app.post('/get-movie-description', async (req, res) => {
  const { mood, genre } = req.body;

  if (!mood || !genre) {
    return res.status(400).json({ error: "Mood and genre are required." });
  }

  const prompt = `
  First line sholud give me Recommended genre:
  Second line sholud give me a story,You are a movie critic. Given the user's mood and genre preferences, write a movie description that matches both the emotional tone and genre:

Mood:
${JSON.stringify(mood, null, 2)}

Genre:
${JSON.stringify(genre, null, 2)}

Write a short movie description (3-4 lines) that aligns with the mood and genre.
`;

  try {
    const result = await model.generateContent(prompt);
    const description = (await result.response).text().trim();
    res.json({ description });
  } catch (err) {
    console.error("Movie description generation failed:", err);
    res.status(500).json({ error: "Movie description generation failed." });
  }
});

// Existing routes

app.get('/next-question', async (req, res) => {
  if (currentQuestionCount >= MAX_QUESTIONS) {
    const probabilities = await generateProbabilities();
    return res.json({ end: true, ...probabilities });
  }

  const questionData = currentQuestionCount === 0 ? await getFirstOpenQuestion() : await getNextMCQQuestion();
  currentQuestionCount++;
  res.json({ end: false, current: currentQuestionCount, ...questionData });
});

app.post('/answer', (req, res) => {
  const { answer } = req.body;
  if (!answer) return res.status(400).json({ error: "Answer is required." });
  if (history[currentQuestionCount - 1]) {
    history[currentQuestionCount - 1].answer = answer;
  }
  res.json({ status: "Answer received." });
});

app.post('/reset', (req, res) => {
  history = [];
  currentQuestionCount = 0;
  usedQuestions.clear();
  res.json({ status: "Session reset." });
});

app.post('/generate-story', async (req, res) => {
  const { mood, genre } = req.body;
  if (!mood || !genre) {
    return res.status(400).json({ error: "Mood and genre probabilities required." });
  }

  const prompt = `
You're an expert movie writer. Given the user's emotional and genre profile:

Mood:
${JSON.stringify(mood, null, 2)}

Genre:
${JSON.stringify(genre, null, 2)}

Write a compelling, genre-relevant short movie plot (3-4 lines) that resonates emotionally with the user's mental state.

Only output the movie story text.
`;

  try {
    const result = await model.generateContent(prompt);
    const story = (await result.response).text().trim();
    res.json({ story });
  } catch (err) {
    console.error("Story generation failed:", err);
    res.status(500).json({ error: "Story generation failed." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Mood app server running at http://localhost:${PORT}`);
});
