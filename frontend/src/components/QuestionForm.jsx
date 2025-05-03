import React from 'react';

const QuestionSection = ({
  questionData,
  userInput,
  setUserInput,
  handleTextSubmit,
  submitAnswer,
}) => (
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
          <button key={index} onClick={() => submitAnswer(opt)} className="option-button hover-scale">
            {opt}
          </button>
        ))}
      </div>
    )}
  </div>
);

export default QuestionSection;
