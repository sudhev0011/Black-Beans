import React from 'react';

const ErrorMessage = () => {
  return (
    <div className="text-center space-y-2 opacity-0 animate-fade-in-delay-1">
      <div className="inline-block px-4 py-1 rounded-full bg-coffee-light text-coffee-espresso text-xs font-medium mb-2">
        Page Not Found
      </div>
      <h1 className="text-5xl sm:text-7xl font-bold text-coffee-espresso font-playfair">
        404
      </h1>
      <p className="text-xl text-coffee-dark max-w-md mx-auto mt-4">
        Oops! Looks like this brew doesn't exist.
      </p>
      <p className="text-coffee-medium max-w-md mx-auto mt-2">
        The page you're looking for may have been moved or deleted.
      </p>
    </div>
  );
};

export default ErrorMessage;