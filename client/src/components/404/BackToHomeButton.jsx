import React from 'react';
import { Link } from 'react-router-dom';

const BackToHomeButton = () => {
  return (
    <div className="mt-8 opacity-0 animate-fade-in-delay-3">
      <Link
        to="/"
        className="inline-flex items-center px-6 py-3 text-base font-medium text-coffee-light bg-coffee-espresso rounded-full shadow-md hover:bg-coffee-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-medium transition-all duration-200 ease-in-out transform hover:scale-105"
      >
        <svg 
          className="mr-2 -ml-1 w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Home
      </Link>
    </div>
  );
};

export default BackToHomeButton;