import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import QuestionSection from '../components/QuestionForm.jsx';
import MoodResult from '../components/MoodResults.jsx';

const MainPage = () => {
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
      console.error('Error resetting session:', error);
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
      console.error('Failed to fetch question:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieStory = async (moodProbabilities) => {
    try {
      const res = await fetch('http://localhost:5000/get-movie-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodProbabilities }),
      });
      const data = await res.json();
      setMovieStory(data.story);
    } catch (error) {
      console.error('Failed to fetch movie story:', error);
    }
  };

  const fetchMovieDescription = async (mood, genre) => {
    try {
      const res = await fetch('http://localhost:5000/get-movie-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, genre }),
      });
      const data = await res.json();
      setMovieDescription(data.description);
      setMovieStory(data.recommendations);
    } catch (error) {
      console.error('Failed to fetch movie description:', error);
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
      console.error('Error submitting answer:', error);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() !== '') {
      submitAnswer(userInput);
    }
  };

  if (loading || !questionData) {
    return <Loader startSession={startSession} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-800 text-white px-4 py-8">
      {moodResult ? (
        <MoodResult
          moodResult={moodResult}
          movieStory={movieStory}
          movieDescription={movieDescription}
        />
      ) : (
        <QuestionSection
          questionData={questionData}
          userInput={userInput}
          setUserInput={setUserInput}
          handleTextSubmit={handleTextSubmit}
          submitAnswer={submitAnswer}
        />
      )}
      <button
        onClick={startSession}
        className="mt-8 px-6 py-3 rounded-full bg-orange-500 text-white text-lg font-semibold hover:bg-orange-400 transition-all duration-300"
      >
        🔁 Start Over
      </button>
    </div>
  );
};

export default MainPage;
