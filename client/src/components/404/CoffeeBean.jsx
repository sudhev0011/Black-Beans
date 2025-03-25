import React from 'react';

const CoffeeBean = ({ className }) => {
  return (
    <div className={`relative ${className || ''}`}>
      <div className="w-8 h-12 bg-coffee-espresso rounded-full transform rotate-45 flex items-center justify-center">
        <div className="w-1 h-8 bg-coffee-cream opacity-50 rounded-full transform -rotate-45"></div>
      </div>
    </div>
  );
};

export default CoffeeBean;