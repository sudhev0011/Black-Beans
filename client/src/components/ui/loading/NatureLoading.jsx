import React, { useEffect, useState } from "react";

const NatureLoading = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#0a1a18] overflow-hidden">
      <div className="relative w-full max-w-md h-80">
        {/* Background elements - falling leaves */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animation: `fall ${Math.random() * 10 + 10}s linear infinite ${Math.random() * 10}s`,
                opacity: Math.random() * 0.4 + 0.1,
              }}
            >
              <svg 
                width={Math.random() * 20 + 10} 
                height={Math.random() * 20 + 10} 
                viewBox="0 0 24 24" 
                fill="#114639"
                style={{
                  animation: `rotate ${Math.random() * 10 + 5}s ease-in-out infinite`,
                }}
              >
                <path d="M17.5,12A5.5,5.5 0 0,1 12,17.5A5.5,5.5 0 0,1 6.5,12A5.5,5.5 0 0,1 12,6.5A5.5,5.5 0 0,1 17.5,12M12,10.5A1.5,1.5 0 0,0 10.5,12A1.5,1.5 0 0,0 12,13.5A1.5,1.5 0 0,0 13.5,12A1.5,1.5 0 0,0 12,10.5M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3Z" />
              </svg>
            </div>
          ))}
        </div>
        
        {/* Growing plant animation */}
        <div className="relative h-full flex flex-col items-center justify-end pb-16">
          {/* Soil */}
          <div 
            className="w-40 h-8 bg-customGreen opacity-20 rounded-full"
            style={{ filter: 'blur(4px)' }}
          />
          
          {/* Stem */}
          <div 
            className="absolute bottom-16 w-1 bg-customGreen rounded-full"
            style={{ 
              height: `${Math.min(progress * 1.5, 150)}px`,
              transition: 'height 0.3s ease-out',
            }}
          />
          
          {/* Leaves */}
          {progress > 20 && (
            <div 
              className="absolute left-1/2 ml-1 bottom-28 origin-bottom-left"
              style={{ 
                animation: 'sway 4s ease-in-out infinite',
                animationDelay: '0.5s',
              }}
            >
              <svg width="30" height="20" viewBox="0 0 30 20" fill="#114639">
                <path d="M0,0 C10,5 20,5 30,0 C20,15 10,15 0,0 Z" />
              </svg>
            </div>
          )}
          
          {progress > 40 && (
            <div 
              className="absolute right-1/2 mr-1 bottom-40 origin-bottom-right"
              style={{ 
                animation: 'sway 4s ease-in-out infinite reverse',
                animationDelay: '0.7s',
              }}
            >
              <svg width="25" height="18" viewBox="0 0 30 20" fill="#114639">
                <path d="M0,0 C10,5 20,5 30,0 C20,15 10,15 0,0 Z" />
              </svg>
            </div>
          )}
          
          {progress > 60 && (
            <div 
              className="absolute left-1/2 ml-1 bottom-52 origin-bottom-left"
              style={{ 
                animation: 'sway 4s ease-in-out infinite',
                animationDelay: '0.9s',
              }}
            >
              <svg width="20" height="15" viewBox="0 0 30 20" fill="#114639">
                <path d="M0,0 C10,5 20,5 30,0 C20,15 10,15 0,0 Z" />
              </svg>
            </div>
          )}
          
          {/* Flower/Bloom */}
          {progress > 80 && (
            <div 
              className="absolute left-1/2 -ml-10 bottom-64 origin-center"
              style={{ 
                animation: 'bloom 3s ease-out forwards',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 100 100" fill="#114639">
                <circle cx="50" cy="50" r="20" />
                {[...Array(8)].map((_, i) => (
                  <ellipse 
                    key={i}
                    cx="50" 
                    cy="50" 
                    rx="15" 
                    ry="25"
                    transform={`rotate(${i * 45} 50 50)`}
                    style={{
                      animation: `pulse 3s infinite ${i * 0.2}s`,
                      transformOrigin: 'center',
                      opacity: 0.8,
                    }}
                  />
                ))}
              </svg>
            </div>
          )}
          
          {/* Water drops */}
          {progress < 90 && (
            <div className="absolute bottom-12 left-1/2 -ml-8 w-16 h-20">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-b-full bg-customGreen opacity-60"
                  style={{
                    left: `${i * 30 + 20}%`,
                    width: '6px',
                    height: '10px',
                    animation: `water-drop 1.5s infinite ${i * 0.3}s`,
                    animationTimingFunction: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
                    transform: 'translateY(-20px)',
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Progress text */}
          <div className="absolute bottom-4 left-0 right-0 text-center font-marcellus text-customGreen">
            <div className="text-sm tracking-wider">
              {progress < 30 && "Planting seed..."}
              {progress >= 30 && progress < 60 && "Growing..."}
              {progress >= 60 && progress < 90 && "Almost there..."}
              {progress >= 90 && "Ready!"}
            </div>
            <div className="text-xs opacity-70 mt-1">{progress}%</div>
          </div>
        </div>
      </div>
      
      {/* Custom animations */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        
        @keyframes rotate {
          0%, 100% {
            transform: rotate(-20deg);
          }
          50% {
            transform: rotate(20deg);
          }
        }
        
        @keyframes sway {
          0%, 100% {
            transform: rotate(-10deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }
        
        @keyframes bloom {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(0.9) rotate(${Math.random() * 45}deg);
          }
          50% {
            transform: scale(1.1) rotate(${Math.random() * 45}deg);
          }
        }
        
        @keyframes water-drop {
          0% {
            transform: translateY(-20px) scaleY(1);
            opacity: 0.6;
          }
          70% {
            transform: translateY(20px) scaleY(1.2);
            opacity: 0.4;
          }
          100% {
            transform: translateY(30px) scaleY(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default NatureLoading;
