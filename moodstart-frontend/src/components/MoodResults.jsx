import React from 'react';

const MoodResult = ({ moodResult, movieDescription, movieStory }) => {
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
                <p className="mb-1"><span className="font-semibold text-indigo-300">Similarity:</span> {movie.similarity.toFixed(2)}</p>
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
