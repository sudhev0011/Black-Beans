import React, { useEffect, useRef, useState } from "react";

const OrganicLoading = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  
  useEffect(() => {
    setIsVisible(true);
    
    // Create ripple effect
    const container = containerRef.current;
    if (!container) return;
    
    const createRipple = () => {
      const ripple = document.createElement('div');
      ripple.className = 'ripple';
      
      // Random position
      const size = Math.random() * 100 + 50;
      const x = Math.random() * container.offsetWidth;
      const y = Math.random() * container.offsetHeight;
      
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.opacity = Math.random() * 0.3 + 0.1;
      ripple.style.animationDuration = `${Math.random() * 3 + 2}s`;
      
      container.appendChild(ripple);
      
      // Remove after animation completes
      setTimeout(() => {
        ripple.remove();
      }, 5000);
    };
    
    // Create initial ripples
    for (let i = 0; i < 10; i++) {
      setTimeout(createRipple, i * 300);
    }
    
    // Continue creating ripples
    const interval = setInterval(createRipple, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0a1a18] overflow-hidden">
      {/* Background container for ripples */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden">
        {/* Ripples will be added here dynamically */}
      </div>
      
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center">
        {/* Main content */}
        <div 
          className={`transform transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {/* Organic blob shape */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <path
                d="M42.7,-57.1C55.9,-49.8,67.7,-38.1,73.7,-23.7C79.7,-9.3,79.8,7.8,74.1,22.4C68.4,37.1,56.8,49.3,43.1,57.6C29.4,65.9,13.7,70.3,-1.2,71.8C-16.1,73.3,-32.2,71.9,-45.2,63.9C-58.2,55.9,-68.1,41.3,-73.3,25.1C-78.5,8.9,-79,-8.9,-73.2,-24.2C-67.4,-39.5,-55.3,-52.3,-41.5,-59.3C-27.7,-66.3,-12.2,-67.5,1.8,-70C15.8,-72.5,29.5,-64.4,42.7,-57.1Z"
                transform="translate(100 100)"
                fill="#114639"
                className="animate-morph"
              />
            </svg>
            
            {/* Inner content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="relative h-16 w-16 mb-2">
                {/* Animated leaf veins */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    d="M50,10 C70,25 70,75 50,90 C30,75 30,25 50,10 Z"
                    fill="none"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1"
                    className="animate-draw"
                  />
                  <path
                    d="M50,20 L50,80"
                    fill="none"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1"
                    className="animate-draw"
                    style={{ animationDelay: '0.5s' }}
                  />
                  <path
                    d="M40,30 C50,50 60,40 60,60"
                    fill="none"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1"
                    className="animate-draw"
                    style={{ animationDelay: '1s' }}
                  />
                  <path
                    d="M40,60 C50,50 60,60 60,30"
                    fill="none"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1"
                    className="animate-draw"
                    style={{ animationDelay: '1.5s' }}
                  />
                </svg>
              </div>
              
              {/* Animated water drops */}
              <div className="relative h-4 w-16 mb-2">
                {[0, 1, 2].map((i) => (
                  <div 
                    key={i}
                    className="absolute top-0 rounded-full bg-white opacity-80"
                    style={{
                      left: `${i * 30 + 20}%`,
                      width: '4px',
                      height: '4px',
                      animation: `water-drop 1.5s infinite ${i * 0.5}s`,
                      transform: 'scale(0)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Text animation */}
          <div className="text-center">
            <div className="overflow-hidden h-8 mb-1">
              <div className="font-marcellus text-customGreen text-2xl tracking-widest animate-reveal">
                WELCOME
              </div>
            </div>
            
            <div className="overflow-hidden h-6">
              <div className="font-marcellus text-customGreen opacity-70 tracking-wider animate-reveal" style={{ animationDelay: '0.3s' }}>
                Preparing your experience
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated ink drops */}
        <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 rounded-full bg-customGreen"
              style={{
                left: `${i * 20 + Math.random() * 10}%`,
                width: `${Math.random() * 30 + 20}px`,
                height: `${Math.random() * 10 + 5}px`,
                opacity: Math.random() * 0.3 + 0.1,
                animation: `ink-rise ${Math.random() * 5 + 5}s infinite ${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Custom animations */}
      <style >{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: #114639;
          transform: scale(0);
          animation: ripple-effect 4s ease-out forwards;
          pointer-events: none;
        }
        
        @keyframes ripple-effect {
          0% {
            transform: scale(0);
            opacity: 0.3;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
        
        @keyframes water-drop {
          0% {
            transform: scale(0) translateY(0);
            opacity: 0.8;
          }
          50% {
            transform: scale(1) translateY(10px);
            opacity: 0.6;
          }
          100% {
            transform: scale(0) translateY(20px);
            opacity: 0;
          }
        }
        
        @keyframes ink-rise {
          0%, 100% {
            transform: translateY(100%) scale(1);
            border-radius: 50% 50% 0 0;
          }
          50% {
            transform: translateY(20%) scale(1.2);
            border-radius: 40% 40% 20% 20%;
          }
        }
        
        .animate-morph {
          animation: morph 8s ease-in-out infinite;
        }
        
        @keyframes morph {
          0%, 100% {
            d: path("M42.7,-57.1C55.9,-49.8,67.7,-38.1,73.7,-23.7C79.7,-9.3,79.8,7.8,74.1,22.4C68.4,37.1,56.8,49.3,43.1,57.6C29.4,65.9,13.7,70.3,-1.2,71.8C-16.1,73.3,-32.2,71.9,-45.2,63.9C-58.2,55.9,-68.1,41.3,-73.3,25.1C-78.5,8.9,-79,-8.9,-73.2,-24.2C-67.4,-39.5,-55.3,-52.3,-41.5,-59.3C-27.7,-66.3,-12.2,-67.5,1.8,-70C15.8,-72.5,29.5,-64.4,42.7,-57.1Z");
          }
          33% {
            d: path("M43.3,-58.4C56.9,-50.9,69.1,-39.2,75.3,-24.5C81.5,-9.8,81.7,8,75.6,22.4C69.5,36.8,57.1,47.8,43.4,56.1C29.7,64.4,14.8,70.1,-0.9,71.3C-16.7,72.6,-33.4,69.5,-47.2,61C-61,52.5,-71.9,38.7,-76.9,22.7C-81.9,6.7,-81,-11.5,-74.4,-27.1C-67.8,-42.7,-55.5,-55.7,-41.5,-62.9C-27.5,-70.1,-13.8,-71.5,0.8,-72.6C15.3,-73.7,29.7,-65.9,43.3,-58.4Z");
          }
          66% {
            d: path("M40.9,-55.1C54.3,-45.2,67.4,-35.1,73.4,-21.3C79.4,-7.5,78.3,9.9,72.2,24.8C66.1,39.7,55,52.1,41.4,60.1C27.8,68.1,11.7,71.7,-3.5,76.3C-18.7,80.9,-37.4,86.5,-51.5,79.9C-65.6,73.3,-75.1,54.5,-79.2,35.6C-83.3,16.7,-82,-2.3,-76.4,-19.2C-70.8,-36.1,-60.9,-50.9,-47.5,-60.8C-34.1,-70.7,-17,-75.7,-1.6,-73.7C13.9,-71.7,27.5,-65,40.9,-55.1Z");
          }
        }
        
        .animate-draw {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: draw 3s ease-in-out infinite alternate;
        }
        
        @keyframes draw {
          from {
            stroke-dashoffset: 100;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        
        .animate-reveal {
          animation: reveal 0.8s ease-out forwards;
          transform: translateY(100%);
        }
        
        @keyframes reveal {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default OrganicLoading;
