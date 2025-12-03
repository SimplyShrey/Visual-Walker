// src/components/Placeholder.js
import React from 'react';

const Placeholder = () => {
  return (
    <div className="placeholder-container">
      <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3V21H21" stroke="#30363d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 17V12" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 17V7" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 17V14" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <p>Select a dataset to begin visualizing</p>
    </div>
  );
};

export default Placeholder;