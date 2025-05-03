import React from 'react';

const MoodResult = ({ moodResult, movieStory, movieDescription }) => (
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
);

export default MoodResult;
