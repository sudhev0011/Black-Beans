import React, { useState } from 'react';
import { Spinner } from './Spinner'; // Adjust the import path

const LoadingButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    // Simulate an async operation
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      style={{
        position: 'relative',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#0070f3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        minWidth: '120px'
      }}
    >
      {isLoading ? (
        <>
          <span style={{ opacity: 0 }}>Submit</span>
          <Spinner 
            size="1" 
            style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white'
            }} 
          />
        </>
      ) : (
        'Submit'
      )}
    </button>
  );
};

export default LoadingButton;