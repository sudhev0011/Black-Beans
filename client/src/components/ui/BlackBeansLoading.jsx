import React from "react";

const BlackBeansLoading = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="absolute w-full h-full border-4 border-t-customGreen border-r-transparent border-b-customGreen/30 border-l-transparent rounded-full animate-spin [animation-duration:3s]"></div>

        <div className="absolute w-4/5 h-4/5 border-4 border-customGreen/40 rounded-full animate-pulse [animation-duration:2s]"></div>

        <div className="absolute w-3/5 h-3/5 border-4 border-t-transparent border-r-customGreen/70 border-b-transparent border-l-customGreen/70 rounded-full animate-spin [animation-duration:2.5s] [animation-direction:reverse]"></div>

        <div className="absolute w-6 h-6 bg-customGreen rounded-full"></div>

        <div
          className="absolute w-3 h-3 bg-customGreen rounded-full animate-bean-float"
          style={{ top: "15%", right: "15%" }}
        ></div>
        <div
          className="absolute w-4 h-4 bg-customGreen/80 rounded-full animate-bean-float"
          style={{ bottom: "20%", left: "15%" }}
        ></div>
        <div
          className="absolute w-2 h-2 bg-customGreen/60 rounded-full animate-bean-float"
          style={{ top: "25%", left: "20%" }}
        ></div>
        <div
          className="absolute w-3 h-3 bg-customGreen/70 rounded-full animate-bean-float"
          style={{ bottom: "15%", right: "20%" }}
        ></div>
      </div>
      {/* Pulsing central dot */}
      <div className="absolute w-6 h-6 bg-customGreen rounded-full animate-pulse [animation-duration:2s]"></div>
        
        {/* Decorative floating dots */}
        <div className="absolute w-3 h-3 bg-customGreen rounded-full" style={{ top: '10%', left: '20%', animationDelay: '0.3s' }}></div>
        <div className="absolute w-4 h-4 bg-customGreen/80 rounded-full" style={{ bottom: '15%', right: '25%', animationDelay: '0.6s' }}></div>
        <div className="absolute w-2 h-2 bg-customGreen/60 rounded-full" style={{ top: '30%', right: '10%', animationDelay: '1s' }}></div>

      <div className="mt-8 text-center">
        <h2 className="font-marcellus text-2xl text-customGreen tracking-wider">
          BLACK BEANS
        </h2>
        <p className="text-customGreen/70 mt-2 text-sm tracking-widest">
          LOADING EXPERIENCE
        </p>
      </div>
    </div>
  );
};
export default BlackBeansLoading;








// import React from "react";

// const BlackBeansLoading = () => {
//   return (
//     <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
//       {/* Bouncing Dots */}
//       <div className="flex space-x-2">
//         <div className="w-4 h-4 bg-customGreen rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
//         <div className="w-4 h-4 bg-customGreen rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
//         <div className="w-4 h-4 bg-customGreen rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
//       </div>

//       {/* Loading Text */}
//       <div className="mt-6 text-center">
//         <h2 className="font-marcellus text-2xl text-white tracking-wider">
//           BLACK BEANS
//         </h2>
//         <p className="text-white/70 mt-2 text-sm tracking-widest">
//           LOADING EXPERIENCE
//         </p>
//       </div>
//     </div>
//   );
// };

// export default BlackBeansLoading;