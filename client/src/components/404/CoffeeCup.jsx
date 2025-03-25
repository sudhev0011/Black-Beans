import React from 'react';

const CoffeeCup = () => {
  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Steam particles */}
      <div className="absolute left-1/2 top-1 -ml-3 w-6 h-10 opacity-0 animate-steam delay-100"></div>
      <div className="absolute left-1/2 top-2 -ml-1 w-5 h-10 opacity-0 animate-steam delay-300"></div>
      <div className="absolute left-1/2 top-0 ml-3 w-4 h-10 opacity-0 animate-steam"></div>

      {/* Cup */}
      <div className="relative mt-10 w-40 h-32 mx-auto">
        {/* Cup body */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-coffee-light rounded-b-3xl rounded-t-sm border-2 border-coffee-medium animate-pulse-gentle overflow-hidden">
          {/* Coffee liquid */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-coffee-dark rounded-b-3xl">
            {/* Coffee surface shine */}
            <div className="absolute top-2 left-6 w-12 h-2 bg-coffee-medium opacity-30 rounded-full transform rotate-12"></div>
            <div className="absolute top-6 right-8 w-8 h-1 bg-coffee-medium opacity-20 rounded-full transform -rotate-6"></div>
          </div>
        </div>
        
        {/* Cup handle */}
        <div className="absolute right-0 top-8 w-8 h-16 border-r-4 border-t-4 border-b-4 border-coffee-medium rounded-r-full"></div>
        
        {/* Saucer */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-48 h-4 bg-coffee-light rounded-full border-2 border-coffee-medium"></div>
      </div>
    </div>
  );
};

export default CoffeeCup;