import React from 'react';

const QuestionSection = ({
  questionData,
  userInput,
  setUserInput,
  handleTextSubmit,
  submitAnswer,
}) => (
  <div className="w-full max-w-3xl text-white space-y-8">
    {/* Question Title */}
    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-400 text-transparent bg-clip-text">
      {questionData.question}
    </h2>

    {/* Text Input Question */}
    {questionData.type === 'text' ? (
      <form onSubmit={handleTextSubmit} className="flex flex-col md:flex-row items-center gap-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your answer..."
          className="w-full md:flex-1 px-4 py-3 rounded-xl bg-[#2d254b] text-white border border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-300"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-full shadow-lg transition duration-300"
        >
          ✍️ Submit
        </button>
      </form>
    ) : (
      // Options (Multiple Choice)
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questionData.options.map((opt, index) => (
          <button
            key={index}
            onClick={() => submitAnswer(opt)}
            className="w-full px-6 py-4 bg-[#2d254b] hover:bg-[#3a2d66] text-white font-semibold rounded-xl border border-indigo-400 shadow-md transition transform hover:scale-105 duration-200"
          >
            {opt}
          </button>
        ))}
      </div>
    )}
  </div>
);

export default QuestionSection;
