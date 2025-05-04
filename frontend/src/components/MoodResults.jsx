import React from 'react';

const MoodResult = ({ moodResult, movieDescription, movieStory }) => {
  return (
    <div className="w-full max-w-3xl bg-white text-black rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Detected Mood</h2>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(moodResult, null, 2)}</pre>

      <h2 className="text-2xl font-bold mt-6 mb-2">Generated Movie Description</h2>
      <p className="bg-yellow-100 p-4 rounded">{movieDescription}</p>

      <h2 className="text-2xl font-bold mt-6 mb-2">Recommended Movies</h2>
      {Array.isArray(movieStory) ? (
        movieStory.map((movie, index) => (
          <div key={index} className="border-t border-gray-300 mt-4 pt-4">
            <h3 className="text-xl font-semibold">{movie.movie_name}</h3>
            <p><strong>Genre:</strong> {movie.genre}</p>
            <p><strong>Overview:</strong> {movie.overview}</p>
            <p><strong>Similarity:</strong> {movie.similarity.toFixed(2)}</p>
          </div>
        ))
      ) : (
        <p>No movie recommendations available.</p>
      )}
    </div>
  );
};

export default MoodResult;
