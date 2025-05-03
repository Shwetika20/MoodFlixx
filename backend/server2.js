const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const usedQuestions = new Set();
const history = [];

async function getFirstOpenQuestion() {
  const question = "What kind of movie are you in the mood to watch today?";
  history.push({ question, answer: "" });
  usedQuestions.add(question);
  return { question, type: "text" };
}

async function getNextMCQQuestion(context) {
  const prompt = `
You're a movie recommendation assistant. Based on the user's initial input and previous answers, generate a NEW and UNIQUE multiple-choice question that explores the kind of movie experience they are looking for.

Focus on the movie they WANT to watch (not their current mood). Ask about preferences such as:
- Protagonist type
- Story tone
- Genre substyle
- Setting
- Emotional payoff

NEVER repeat previous questions.

Respond ONLY in this JSON format:
{
  "question": "Your question here",
  "options": ["Option1", "Option2", "Option3", "Option4"]
}

Previous questions:
${history.map((h, i) => `Q${i + 1}: ${h.question}`).join('\n')}

Conversation history:
${context}
`.trim();

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant generating questions." },
      { role: "user", content: prompt },
    ],
    model: "gpt-4",
    temperature: 0.7,
  });

  const response = completion.choices[0].message.content;

  try {
    const parsed = JSON.parse(response);
    if (parsed.question && parsed.options && Array.isArray(parsed.options)) {
      if (!usedQuestions.has(parsed.question)) {
        history.push({ question: parsed.question, answer: "" });
        usedQuestions.add(parsed.question);
        return { question: parsed.question, options: parsed.options, type: "mcq" };
      }
    }
  } catch (error) {
    console.error("Error parsing MCQ response:", error, response);
  }

  return null;
}

function recordAnswer(question, answer) {
  const entry = history.find((h) => h.question === question);
  if (entry) {
    entry.answer = answer;
  }
}

async function getExperienceAndGenrePreferences() {
  const answersText = history
    .map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`)
    .join("\n\n");

  const prompt = `
Based on the user's answers below, determine:

1. Their ideal movie mood/experience: ["Chill", "Romantic", "Suspenseful", "Dark", "Feel-good", "Inspirational", "Funny", "Epic"]
2. Most preferred genres: ["Action", "Comedy", "Drama", "Romance", "Sci-Fi", "Thriller", "Fantasy", "Horror", "Mystery"]

Respond ONLY in this format:
{
  "experience": {
    "Chill": %, "Romantic": %, ...
  },
  "genre": {
    "Action": %, "Comedy": %, ...
  }
}

Data:
${answersText}
`.trim();

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are an assistant that analyzes answers and returns movie mood and genre preference probabilities." },
      { role: "user", content: prompt },
    ],
    model: "gpt-4",
    temperature: 0.7,
  });

  try {
    const json = JSON.parse(completion.choices[0].message.content);
    return json;
  } catch (error) {
    console.error("Error parsing experience/genre JSON:", error);
    return null;
  }
}

async function getMovieRecommendation(experience, genre) {
  const prompt = `
You are a movie critic. Based on the user's desired movie experience and genre preferences, suggest a movie that fits both.

Experience preferences:
${JSON.stringify(experience, null, 2)}

Genre preferences:
${JSON.stringify(genre, null, 2)}

Write a short movie description (3-4 lines) that aligns with the top preferences.
`.trim();

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a movie critic recommending movies based on viewer preferences." },
      { role: "user", content: prompt },
    ],
    model: "gpt-4",
    temperature: 0.9,
  });

  return completion.choices[0].message.content.trim();
}

module.exports = {
  getFirstOpenQuestion,
  getNextMCQQuestion,
  recordAnswer,
  getExperienceAndGenrePreferences,
  getMovieRecommendation,
};
