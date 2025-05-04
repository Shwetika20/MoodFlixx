import React, { useState, useEffect } from 'react';
import Loader from '../Loader.jsx';
import QuestionSection from '../components/QuestionForm.jsx';
import MoodResult from '../components/MoodResults.jsx';

const MainPage = () => {
  const [questionData, setQuestionData] = useState({type: "text", question: "?"});
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [moodResult, setMoodResult] = useState(null);
  const [movieStory, setMovieStory] = useState(null);
  const [movieDescription, setMovieDescription] = useState(null);

  // useEffect(() => {
  //   console.log("hello");
  //   startSession();
  // }, []);

  // const startSession = async () => {
  //   try {
  //     await fetch('http://localhost:5001/reset', { method: 'POST' });
  //     setMoodResult(null);
  //     setMovieStory(null);
  //     setMovieDescription(null);
  //     const res = await fetch('http://localhost:5001/next-question');
  //     const data = await res.json();
  //     setQuestionData(data);
  //     setUserInput('');
  
  //     // getNextQuestion();
  //   } catch (error) {
  //     console.error('Error resetting session:', error);
  //   }
  // };


  const onsubmitfunction = async () => {
    try {
      await fetch('http://localhost:5001/reset', { method: 'POST' });
      setMoodResult(null);
      setMovieStory(null);
      setMovieDescription(null);
      getNextQuestion();
    } catch (error) {
      console.error('Error resetting session:', error);
    }
  }

  const getNextQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/next-question');
      const data = await res.json();
      console.log(data);
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
      const res = await fetch('http://localhost:5001/get-movie-description', {
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
      const res = await fetch('http://localhost:5001/get-movie-description', {
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
      await fetch('http://localhost:5001/answer', {
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
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-[#1f1b38] rounded-2xl shadow-2xl p-8 md:p-12 flex flex-col items-center">
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
          onClick={onsubmitfunction}
          className="mt-10 px-6 py-3 rounded-full bg-pink-600 text-white text-lg font-bold hover:bg-pink-500 transition duration-300 shadow-md"
        >
          🔁 Start Over
        </button>
      </div>
    </div>
  );
};

export default MainPage;
