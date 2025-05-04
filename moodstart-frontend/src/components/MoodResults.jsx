import React from 'react';

const MoodResult = ({ moodResult, movieDescription, movieStory }) => {

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
      const response = await fetch('http://localhost:5000/api/deepsearch', {
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
        alert(`DeepSearch result: ${data.result || 'Success'}`);
      } else {
        alert(`DeepSearch failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('DeepSearch error:', error);
      alert('Error during DeepSearch.');
    }
  };

  return (
    <div className="w-full max-w-4xl bg-[#1f1b38] text-white rounded-2xl p-8 shadow-2xl">
      {/* Detected Mood */}
      <section className="mb-8">
        <h2 className="text-3xl font-extrabold mb-4 border-b border-pink-500 pb-2">🧠 Detected Mood</h2>
        <pre className="bg-[#2d274b] p-4 rounded-lg overflow-x-auto text-sm text-pink-300">
          {JSON.stringify(moodResult, null, 2)}
        </pre>
      </section>

      {/* Movie Description */}
      <section className="mb-8">
        <h2 className="text-3xl font-extrabold mb-4 border-b border-yellow-400 pb-2">🎬 Movie Description</h2>
        <p className="bg-[#3a315c] p-5 rounded-lg text-yellow-200 leading-relaxed">
          {movieDescription}
        </p>
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
                    💾 Save to History
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300">No movie recommendations available.</p>
        )}
      </section>
    </div>
  );
};

export default MoodResult;
