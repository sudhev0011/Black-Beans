import React, { useState, useEffect } from 'react';

const BeanSpinnerLoader = () => {
  const [progress, setProgress] = useState(0);
  const primaryColor = "#114639";
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    
    return () => clearInterval(timer);
  }, []);
  
  // Calculate positions for beans around the circle
  const beanCount = 12;
  const beans = Array.from({ length: beanCount }, (_, i) => {
    const angle = (i / beanCount) * 360;
    return angle;
  });

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-stone-100">
      {/* Brand name */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: primaryColor }}>
          BLACK BEANS
        </h1>
        <p className="text-sm text-stone-600">Premium Coffee</p>
      </div>
      
      {/* Bean spinner */}
      <div className="relative w-40 h-40">
        {/* Static ring */}
        <div className="absolute inset-0 border-4 border-stone-200 rounded-full opacity-30"></div>
        
        {/* Rotating beans */}
        <div 
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: '3s' }}
        >
          {beans.map((angle, index) => (
            <div 
              key={index}
              className="absolute w-8 h-5 top-1/2 left-1/2"
              style={{ 
                transform: `rotate(${angle}deg) translateY(-54px) rotate(${angle + 30}deg)`
              }}
            >
              {/* Coffee bean shape */}
              <div className="w-full h-full bg-stone-800 rounded-full flex items-center justify-center">
                <div className="w-5 h-2 bg-stone-100 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Progress indicator */}
        <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center shadow-inner">
          <div className="text-2xl font-bold" style={{ color: primaryColor }}>
            {progress}%
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="mt-8 text-stone-600">
        Loading your coffee experience...
      </div>
    </div>
  );
};

export default BeanSpinnerLoader;