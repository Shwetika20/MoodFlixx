import React, { useState } from 'react';

const MoodResult = ({ moodResult, movieDescription, movieStory }) => {
  // State to store the DeepSearch result
  const [deepSearchResult, setDeepSearchResult] = useState(null);

  // Extract relevant mood information
  const { Happy, Sad, Angry, Calm, Anxious, Excited } = moodResult || {};

  const onSaveToHistory = async (movie) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('No token found. Please log in again.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/user/save-movie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          name: movie.movie_name,
          genre: movie.genre,
          overview: movie.overview,
        }),
      });

      const text = await response.text(); // Get raw text first
      console.log('Response text:', text); // Log to inspect

      if (response.ok) {
        const data = text ? JSON.parse(text) : {};
        alert(data.message || 'Movie saved to history!');
      } else {
        alert('Failed to save movie.');
      }
    } catch (error) {
      console.error('Error saving movie:', error);
      alert('Something went wrong while saving.');
    }
  };

  const onDeepSearch = async (movie) => {
    try {
      const response = await fetch('http://localhost:5004/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movie_name: movie.movie_name,
          genre: movie.genre,
          overview: movie.overview,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data);
        // Assuming `data.recommendations` is an array of movie objects
        const recommendations = data.recommendations || [];
        setDeepSearchResult(recommendations.length ? recommendations : 'No recommendations found');
      } else {
        setDeepSearchResult(data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('DeepSearch error:', error);
      setDeepSearchResult('Error during DeepSearch.');
    }
};


  // Helper function to render a mood bar
  const renderMoodBar = (mood, confidence) => (
    <div className="flex items-center space-x-4">
      <div className="w-1/3 text-lg font-semibold text-indigo-300">{mood}</div>
      <div className="flex-1 bg-gray-700 rounded-full h-4">
        <div
          className="h-4 rounded-full"
          style={{
            width: `${confidence}%`,
            backgroundColor: confidence > 50 ? '#4caf50' : '#ff5722',
          }}
        ></div>
      </div>
      <div className="w-16 text-center font-semibold text-pink-300">{confidence}%</div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl bg-[#1f1b38] text-white rounded-2xl p-8 shadow-2xl">
      {/* Detected Mood */}
      <section className="mb-8">
        <h2 className="text-3xl font-extrabold mb-4 border-b border-pink-500 pb-2">🧠 Detected Mood</h2>
        <div className="space-y-6">
          {Happy !== undefined && renderMoodBar('Happy', Happy)}
          {Sad !== undefined && renderMoodBar('Sad', Sad)}
          {Angry !== undefined && renderMoodBar('Angry', Angry)}
          {Calm !== undefined && renderMoodBar('Calm', Calm)}
          {Anxious !== undefined && renderMoodBar('Anxious', Anxious)}
          {Excited !== undefined && renderMoodBar('Excited', Excited)}
        </div>
      </section>

      {/* Movie Recommendations */}
      <section>
        <h2 className="text-3xl font-extrabold mb-4 border-b border-indigo-400 pb-2">🍿 Recommended Movies</h2>
        {Array.isArray(movieStory) && movieStory.length > 0 ? (
          <div className="space-y-6">
            {movieStory.map((movie, index) => (
              <div
                key={index}
                className="bg-[#2c254d] hover:bg-[#372d60] transition-all duration-300 rounded-xl p-5 shadow-md"
              >
                <h3 className="text-2xl font-bold text-pink-400 mb-2">{movie.movie_name}</h3>
                <p className="mb-1"><span className="font-semibold text-indigo-300">Genre:</span> {movie.genre}</p>
                <p className="mb-1"><span className="font-semibold text-indigo-300">Overview:</span> {movie.overview}</p>
                <p className="mb-4"><span className="font-semibold text-indigo-300">Similarity:</span> {movie.similarity.toFixed(2)}</p>

                <div className="flex space-x-4">
                  <button
                    onClick={() => onDeepSearch(movie)}
                    className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
                  >
                    🔍 DeepSearch
                  </button>
                  <button
                    onClick={() => onSaveToHistory(movie)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
                  >
                    💾 Watch
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300">No movie recommendations available.</p>
        )}
      </section>

      <div className="flex flex-wrap justify-center gap-6 p-6">
        {Array.isArray(deepSearchResult) ? (
          deepSearchResult.map((recommendation, index) => (
            <div
              key={index}
              className="bg-gray-900 text-white p-6 rounded-lg w-60 shadow-lg transition-all duration-300 transform hover:translate-y-2 hover:shadow-2xl cursor-pointer text-center"
            >
              <h3 className="text-lg font-semibold mb-4 hover:text-red-500">{recommendation.movie_name}</h3>
              <p className="text-sm text-yellow-400 mb-4">{recommendation.genre}</p>
              <p className="text-xs text-gray-400">{recommendation.overview}</p>
            </div>
          ))
        ) : (
          <p className="text-white">{deepSearchResult}</p>
        )}
      </div>


    </div>
  );
};

export default MoodResult;
