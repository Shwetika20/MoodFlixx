import React from 'react';
import { Circles } from 'react-loader-spinner';

const Loader = ({ startSession }) => (
  <div className="App loading-container">
    <Circles height="80" width="80" color="#4fa94d" ariaLabel="loading" visible />
    <h2>Loading question...</h2>
    <button onClick={startSession} className="restart-button">
      🔁 Start Over
    </button>
  </div>
);

export default Loader;
