import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

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
  const question = "What kind of movie you want to watch?";
  history.push({ question, answer: "" });
  usedQuestions.add(question);
  return { question, type: "text" };
}

async function getNextMCQQuestion() {
  const context = history.map((entry, idx) => `Q${idx + 1}: ${entry.question}\nA${idx + 1}: ${entry.answer}`).join('\n');
  const prompt = `
You are a movie recommendation expert helping a user narrow down their movie preferences.

Based on the following conversation history, generate ONE NEW and UNIQUE multiple-choice question that helps identify what kind of movie the user would enjoy.

Guidelines:
- Keep the question concise it should be somewaht short and optons.
- Avoid repeating or rephrasing previously asked questions.
- Focus on storytelling elements like plot types, themes, main characters, pacing, etc.
- Each option should be distinct and insightful.
- Do NOT include any explanation or extra text.
- Return ONLY a valid JSON in the following format:

{
  "question": "Your question here",
  "options": ["Option1", "Option2", "Option3", "Option4"]
}

Previously asked questions:
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
You're a movie preference inference engine.

Given the user's answers to the following questions, analyze and return a JSON object with two sections:
- "mood": a list of inferred emotional states or vibes the user may prefer in a movie (e.g., "uplifting", "dark", "suspenseful").
- "genre": a list of likely genres the user would enjoy (e.g., "thriller", "comedy", "drama", "sci-fi").

Ensure your response is purely valid JSON. Avoid any explanation.

User Q&A:
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

app.post('/get-movie-description', async (req, res) => {
  const { mood, genre } = req.body;

  if (!mood || !genre) {
    return res.status(400).json({ error: "Mood and genre are required." });
  }

  const prompt = `
You're a creative screenwriter and genre expert.

Based on the user's inferred mood and genre preferences below, do the following:

1. On the first line, print: Recommended Genre: <Your Recommendation>
2. Then write a short and original movie description (3–5 lines) that fits both mood and genre.
3. Avoid clichés and be specific with character roles, setting, or conflict.

Mood Preferences:
${JSON.stringify(mood, null, 2)}

Genre Preferences:
${JSON.stringify(genre, null, 2)}
`;

  try {
    const result = await model.generateContent(prompt);
    const plot = (await result.response).text().trim();

    const recommendResponse = await axios.post('http://localhost:5002/recommend', { plot });
    const recommendations = recommendResponse.data;

    res.json({ plot, recommendations });
  } catch (err) {
    console.error("Error during generation or recommendation:", err.message);
    res.status(500).json({ error: "Failed to generate movie description or get recommendations." });
  }
});

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

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`Mood app server running at http://localhost:${PORT}`);
});
