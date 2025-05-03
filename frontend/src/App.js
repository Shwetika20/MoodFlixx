import React, { useState, useEffect } from 'react';
import './App.css';
import { Circles } from 'react-loader-spinner';

function App() {
  const [questionData, setQuestionData] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [moodResult, setMoodResult] = useState(null);
  const [movieStory, setMovieStory] = useState(null);
  const [movieDescription, setMovieDescription] = useState(null);

  useEffect(() => {
    startSession();
  }, []);

  const startSession = async () => {
    try {
      await fetch('http://localhost:5000/reset', { method: 'POST' });
      setMoodResult(null);
      setMovieStory(null);
      setMovieDescription(null);
      getNextQuestion();
    } catch (error) {
      console.error("Error resetting session:", error);
    }
  };

  const getNextQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/next-question');
      const data = await res.json();
      setQuestionData(data);
      setUserInput('');

      if (data.end && data.mood) {
        setMoodResult(data.mood);
        fetchMovieStory(data.mood);
        fetchMovieDescription(data.mood, data.genre);
      }
    } catch (error) {
      console.error("Failed to fetch question:", error);
      setQuestionData({ question: "Something went wrong. Please try again later.", type: "text" });
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieStory = async (moodProbabilities) => {
    try {
      const res = await fetch('http://localhost:5000/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodProbabilities }),
      });

      const data = await res.json();
      setMovieStory(data.story);
    } catch (error) {
      console.error("Failed to fetch movie story:", error);
    }
  };

  const fetchMovieDescription = async (mood, genre) => {
  try {
    const res = await fetch('http://localhost:5000/get-movie-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, genre })
    });
    const data = await res.json();
    setMovieDescription(data.description);
    setMovieStory(data.recommendations);
  } catch (error) {
    console.error("Failed to fetch movie description:", error);
  }
};


  const submitAnswer = async (answer) => {
    try {
      await fetch('http://localhost:5000/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });
      getNextQuestion();
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() !== '') {
      submitAnswer(userInput);
    }
  };

    if (loading || !questionData) {
    return (
      <div className="App loading-container">
        <Circles 
          height="80" 
          width="80" 
          color="#4fa94d" 
          ariaLabel="circles-loading"
          wrapperStyle={{}} 
          wrapperClass="" 
          visible={true}
        />
        <h2>Loading question...</h2>
        <button onClick={startSession} className="restart-button">🔁 Start Over</button>
      </div>
    );
  }


  return (
    <div className="app-container">
  {moodResult ? (
    <div className="results-section fade-in">
      <h2 className="section-title gradient-text">🎭 Your Mood Probabilities</h2>
      <ul className="mood-list">
        {Object.entries(moodResult).map(([mood, value]) => (
          <li key={mood} className="mood-item">
            <span className="mood-name">{mood}</span>
            <span className="mood-value">{value.toFixed(2)}%</span>
          </li>
        ))}
      </ul>

      {movieStory && (
        <div className="movie-card fade-in-delay">
          <h3 className="movie-heading">🎬 Recommended Movie Story</h3>
          <p className="movie-text">{movieStory}</p>
        </div>
      )}

      {movieDescription && (
        <div className="movie-card fade-in-delay">
          <h3 className="movie-heading">📖 Movie Description</h3>
          <p className="movie-text">{movieDescription}</p>
        </div>
      )}
    </div>
  ) : (
    <div className="question-section fade-in">
      <h2 className="section-title gradient-text">{questionData.question}</h2>
      {questionData.type === 'text' ? (
        <form onSubmit={handleTextSubmit} className="form-group">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your answer..."
            className="text-input fancy-input"
          />
          <button type="submit" className="submit-button glow-button">Submit</button>
        </form>
      ) : (
        <div className="options-grid">
          {questionData.options.map((opt, index) => (
            <button
              key={index}
              onClick={() => submitAnswer(opt)}
              className="option-button hover-scale"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )}

  <button onClick={startSession} className="restart-button neon-border">
    🔁 Start Over
  </button>
</div>

  );
}

export default App;