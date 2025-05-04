import React, { useState, useEffect } from 'react';
import Loader from '../Loader.jsx';
import QuestionSection from '../components/QuestionForm.jsx';
import MoodResult from '../components/MoodResults.jsx';
import NavBar from '../components/NavBar.jsx';

const MainPage2 = () => {
  const [questionData, setQuestionData] = useState({
    type: 'text',
    question: 'What kind of movie do you want to watch?',
  });
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [moodResult, setMoodResult] = useState(null);
  const [movieSummary, setMovieSummary] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  // Optional: Uncomment to auto-start session on load
  // useEffect(() => {
  //   onSubmitStartOver();
  // }, []);

  const onSubmitStartOver = async () => {
    try {
      await fetch('http://localhost:5003/reset', { method: 'POST' });
      setMoodResult(null);
      setMovieSummary(null);
      setRecommendations(null);
      getNextQuestion();
    } catch (error) {
      console.error('Error resetting session:', error);
    }
  };

  const getNextQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5003/next-question');
      const data = await res.json();
      console.log(data);
      setQuestionData(data);
      setUserInput('');

      if (data.end && data.mood) {
        setMoodResult(data.mood);
        fetchMovieDetails(data.mood, data.genre);
      }
    } catch (error) {
      console.error('Failed to fetch question:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieDetails = async (mood, genre) => {
    try {
      const res = await fetch('http://localhost:5003/get-movie-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, genre }),
      });
      const data = await res.json();
      console.log(data);
      setMovieSummary(data.description);
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Failed to fetch movie details:', error);
    }
  };

  const submitAnswer = async (answer) => {
    try {
      await fetch('http://localhost:5003/answer', {
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <NavBar />
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-[#1f1b38] rounded-2xl shadow-2xl p-8 md:p-12 flex flex-col items-center">
          {moodResult ? (
            <MoodResult
              moodResult={moodResult}
              movieStory={recommendations}
              movieDescription={movieSummary}
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
            onClick={onSubmitStartOver}
            className="mt-10 px-6 py-3 rounded-full bg-pink-600 text-white text-lg font-bold hover:bg-pink-500 transition duration-300 shadow-md"
          >
            🔁 Start Over
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPage2;
