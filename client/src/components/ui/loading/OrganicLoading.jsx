// import React, { useEffect, useRef, useState } from "react";

// const OrganicLoading = () => {
//   const [isVisible, setIsVisible] = useState(false);
//   const containerRef = useRef(null);
  
//   useEffect(() => {
//     setIsVisible(true);
//   }, []);

//   return (
//     <div className="fixed inset-0 bg-white dark:bg-[#0a1a18] overflow-hidden">
//       {/* Clean background with no elements */}
//       <div ref={containerRef} className="absolute inset-0 overflow-hidden">
//         {/* No background elements */}
//       </div>
      
//       <div className="relative z-10 h-full w-full flex flex-col items-center justify-center">
//         {/* Main content */}
//         <div 
//           className={`transform transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
//         >
//           {/* Organic blob shape */}
//           <div className="relative w-64 h-64 flex items-center justify-center mb-8">
//             <svg viewBox="0 0 200 200" className="w-full h-full">
//               <path
//                 d="M42.7,-57.1C55.9,-49.8,67.7,-38.1,73.7,-23.7C79.7,-9.3,79.8,7.8,74.1,22.4C68.4,37.1,56.8,49.3,43.1,57.6C29.4,65.9,13.7,70.3,-1.2,71.8C-16.1,73.3,-32.2,71.9,-45.2,63.9C-58.2,55.9,-68.1,41.3,-73.3,25.1C-78.5,8.9,-79,-8.9,-73.2,-24.2C-67.4,-39.5,-55.3,-52.3,-41.5,-59.3C-27.7,-66.3,-12.2,-67.5,1.8,-70C15.8,-72.5,29.5,-64.4,42.7,-57.1Z"
//                 transform="translate(100 100)"
//                 fill="#114639"
//                 className="animate-morph"
//               />
//             </svg>
            
//             {/* Inner content */}
//             <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
//               <div className="relative h-16 w-16 mb-2">
//                 {/* Animated leaf veins */}
//                 <svg viewBox="0 0 100 100" className="w-full h-full">
//                   <path
//                     d="M50,10 C70,25 70,75 50,90 C30,75 30,25 50,10 Z"
//                     fill="none"
//                     stroke="rgba(255,255,255,0.7)"
//                     strokeWidth="1"
//                     className="animate-draw"
//                   />
//                   <path
//                     d="M50,20 L50,80"
//                     fill="none"
//                     stroke="rgba(255,255,255,0.7)"
//                     strokeWidth="1"
//                     className="animate-draw"
//                     style={{ animationDelay: '0.5s' }}
//                   />
//                   <path
//                     d="M40,30 C50,50 60,40 60,60"
//                     fill="none"
//                     stroke="rgba(255,255,255,0.7)"
//                     strokeWidth="1"
//                     className="animate-draw"
//                     style={{ animationDelay: '1s' }}
//                   />
//                   <path
//                     d="M40,60 C50,50 60,60 60,30"
//                     fill="none"
//                     stroke="rgba(255,255,255,0.7)"
//                     strokeWidth="1"
//                     className="animate-draw"
//                     style={{ animationDelay: '1.5s' }}
//                   />
//                 </svg>
//               </div>
              
//               {/* Animated water drops */}
//               <div className="relative h-4 w-16 mb-2">
//                 {[0, 1, 2].map((i) => (
//                   <div 
//                     key={i}
//                     className="absolute top-0 rounded-full bg-white opacity-80"
//                     style={{
//                       left: `${i * 30 + 20}%`,
//                       width: '4px',
//                       height: '4px',
//                       animation: `water-drop 1.5s infinite ${i * 0.5}s`,
//                       transform: 'scale(0)',
//                     }}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
          
//           {/* Text animation */}
//           <div className="text-center">
//             <div className="overflow-hidden h-8 mb-1">
//               <div className="font-marcellus text-customGreen text-2xl tracking-widest animate-reveal">
//                 WELCOME
//               </div>
//             </div>
            
//             <div className="overflow-hidden h-6">
//               <div className="font-marcellus text-customGreen opacity-70 tracking-wider animate-reveal" style={{ animationDelay: '0.3s' }}>
//                 Preparing your experience
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Custom styles */}
//       <style >{`
//         /* Removed static background element styles */
        
//         @keyframes water-drop {
//           0% {
//             transform: scale(0) translateY(0);
//             opacity: 0.8;
//           }
//           50% {
//             transform: scale(1) translateY(10px);
//             opacity: 0.6;
//           }
//           100% {
//             transform: scale(0) translateY(20px);
//             opacity: 0;
//           }
//         }
        
//         .animate-morph {
//           animation: morph 8s ease-in-out infinite;
//         }
        
//         @keyframes morph {
//           0%, 100% {
//             d: path("M42.7,-57.1C55.9,-49.8,67.7,-38.1,73.7,-23.7C79.7,-9.3,79.8,7.8,74.1,22.4C68.4,37.1,56.8,49.3,43.1,57.6C29.4,65.9,13.7,70.3,-1.2,71.8C-16.1,73.3,-32.2,71.9,-45.2,63.9C-58.2,55.9,-68.1,41.3,-73.3,25.1C-78.5,8.9,-79,-8.9,-73.2,-24.2C-67.4,-39.5,-55.3,-52.3,-41.5,-59.3C-27.7,-66.3,-12.2,-67.5,1.8,-70C15.8,-72.5,29.5,-64.4,42.7,-57.1Z");
//           }
//           33% {
//             d: path("M43.3,-58.4C56.9,-50.9,69.1,-39.2,75.3,-24.5C81.5,-9.8,81.7,8,75.6,22.4C69.5,36.8,57.1,47.8,43.4,56.1C29.7,64.4,14.8,70.1,-0.9,71.3C-16.7,72.6,-33.4,69.5,-47.2,61C-61,52.5,-71.9,38.7,-76.9,22.7C-81.9,6.7,-81,-11.5,-74.4,-27.1C-67.8,-42.7,-55.5,-55.7,-41.5,-62.9C-27.5,-70.1,-13.8,-71.5,0.8,-72.6C15.3,-73.7,29.7,-65.9,43.3,-58.4Z");
//           }
//           66% {
//             d: path("M40.9,-55.1C54.3,-45.2,67.4,-35.1,73.4,-21.3C79.4,-7.5,78.3,9.9,72.2,24.8C66.1,39.7,55,52.1,41.4,60.1C27.8,68.1,11.7,71.7,-3.5,76.3C-18.7,80.9,-37.4,86.5,-51.5,79.9C-65.6,73.3,-75.1,54.5,-79.2,35.6C-83.3,16.7,-82,-2.3,-76.4,-19.2C-70.8,-36.1,-60.9,-50.9,-47.5,-60.8C-34.1,-70.7,-17,-75.7,-1.6,-73.7C13.9,-71.7,27.5,-65,40.9,-55.1Z");
//           }
//         }
        
//         .animate-draw {
//           stroke-dasharray: 100;
//           stroke-dashoffset: 100;
//           animation: draw 3s ease-in-out infinite alternate;
//         }
        
//         @keyframes draw {
//           from {
//             stroke-dashoffset: 100;
//           }
//           to {
//             stroke-dashoffset: 0;
//           }
//         }
        
//         .animate-reveal {
//           animation: reveal 0.8s ease-out forwards;
//           transform: translateY(100%);
//         }
        
//         @keyframes reveal {
//           from {
//             transform: translateY(100%);
//           }
//           to {
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default OrganicLoading;



import { useEffect, useRef, useState } from "react"

const OrganicLoading = () => {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0a1a18] overflow-hidden">
      {/* Clean background with no elements */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden">
        {/* No background elements */}
      </div>

      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center">
        {/* Main content */}
        <div
          className={`transform transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
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
                {/* Coffee cup and steam animations */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Coffee cup */}
                  <path
                    d="M30,70 L30,40 C30,30 70,30 70,40 L70,70 C70,80 30,80 30,70 Z"
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2"
                    className="animate-draw"
                  />

                  {/* Cup handle */}
                  <path
                    d="M70,45 C80,45 80,55 70,55"
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2"
                    className="animate-draw"
                    style={{ animationDelay: "0.5s" }}
                  />

                  {/* Coffee surface */}
                  <path
                    d="M35,45 C40,43 60,43 65,45"
                    fill="none"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1.5"
                    className="animate-draw"
                    style={{ animationDelay: "1s" }}
                  />

                  {/* Steam 1 */}
                  <path
                    d="M40,30 C42,25 38,20 40,15"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1.5"
                    className="animate-steam"
                  />

                  {/* Steam 2 */}
                  <path
                    d="M50,30 C53,23 47,18 50,12"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1.5"
                    className="animate-steam"
                    style={{ animationDelay: "0.3s" }}
                  />

                  {/* Steam 3 */}
                  <path
                    d="M60,30 C63,25 57,20 60,15"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1.5"
                    className="animate-steam"
                    style={{ animationDelay: "0.6s" }}
                  />

                  {/* Coffee bean 1 */}
                  <ellipse
                    cx="40"
                    cy="90"
                    rx="5"
                    ry="3"
                    transform="rotate(-30, 40, 90)"
                    fill="none"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1"
                    className="animate-draw"
                    style={{ animationDelay: "1.5s" }}
                  />

                  {/* Coffee bean 2 */}
                  <ellipse
                    cx="60"
                    cy="90"
                    rx="5"
                    ry="3"
                    transform="rotate(30, 60, 90)"
                    fill="none"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1"
                    className="animate-draw"
                    style={{ animationDelay: "1.8s" }}
                  />
                </svg>
              </div>

              {/* Animated coffee drips */}
              <div className="relative h-4 w-16 mb-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="absolute top-0 rounded-full bg-white opacity-80"
                    style={{
                      left: `${i * 30 + 20}%`,
                      width: "4px",
                      height: "4px",
                      animation: `coffee-drip 1.5s infinite ${i * 0.5}s`,
                      transform: "scale(0)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Text animation */}
          <div className="text-center">
            <div className="overflow-hidden h-8 mb-1">
              <div className="font-marcellus text-customGreen text-2xl tracking-widest animate-reveal">WELCOME</div>
            </div>

            <div className="overflow-hidden h-6">
              <div
                className="font-marcellus text-customGreen opacity-70 tracking-wider animate-reveal"
                style={{ animationDelay: "0.3s" }}
              >
                Brewing your experience
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style jsx>{`
        @keyframes coffee-drip {
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
        
        .animate-steam {
          stroke-dasharray: 20;
          stroke-dashoffset: 20;
          animation: steam 3s ease-in-out infinite;
          opacity: 0;
        }
        
        @keyframes steam {
          0% {
            stroke-dashoffset: 20;
            opacity: 0;
          }
          20% {
            opacity: 0.7;
          }
          80% {
            opacity: 0.7;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
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
  )
}

export default OrganicLoading