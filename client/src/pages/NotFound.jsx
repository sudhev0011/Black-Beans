// import React, { useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import CoffeeCup from '../components/404/CoffeeCup';
// import ErrorMessage from '../components/404/ErrorMessage';
// import BackToHomeButton from '../components/404/BackToHomeButton';
// import BackgroundDecoration from '../components/404/BackgroundDecoration';
// import SuggestedLinks from '../components/404/SuggestedLinks';

// const NotFound = () => {
//   const location = useLocation();

//   useEffect(() => {
//     console.error(
//       "404 Error: User attempted to access non-existent route:",
//       location.pathname
//     );
    
//     // Add subtle animation to the page when it loads
//     document.body.classList.add('overflow-hidden');
    
//     return () => {
//       document.body.classList.remove('overflow-hidden');
//     };
//   }, [location.pathname]);

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden relative">
//       <BackgroundDecoration />
      
//       <div className="w-full max-w-3xl mx-auto glass-panel rounded-2xl p-8 shadow-xl border border-coffee-cream/20 opacity-0 animate-fade-in">
//         <div className="flex flex-col items-center">
//           <CoffeeCup />
//           <ErrorMessage />
//           <SuggestedLinks />
//           <BackToHomeButton />
//         </div>
//       </div>
      
//       <footer className="mt-auto pt-8 pb-4 w-full text-center text-coffee-medium text-sm opacity-0 animate-fade-in-delay-3">
//         <p>© {new Date().getFullYear()} Coffee Canvas • All rights reserved</p>
//       </footer>
//     </div>
//   );
// };

// export default NotFound;




import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
export default function NotFound() {
  return (<>

{/* Main Content */}
<main className="flex-1 py-1">
  <div className="container mx-auto px-4 text-center">
    <div className="mx-auto max-w-lg">
      <img
        src="/404.png"
        alt="404 Illustration"
        width={600}
        height={270}
        className="mx-auto"
      />
      <h1 className="mb-4 text-4xl font-bold text-[#333333] md:text-5xl">That Page Can't Be Found</h1>
      <p className="mb-8 text-[#6b7280]">
        It looks like nothing was found at this location. Maybe try to search for what you are looking for?
      </p>
      <Link
        href="/"
        className="inline-block rounded bg-[#114639] px-6 py-3 font-medium text-white transition-colors hover:bg-opacity-90"
      >
        Go To Homepage
      </Link>
    </div>
  </div>
</main>
</>)
}