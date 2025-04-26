"use client"

import { useEffect, useState } from "react"

const CreativeLoading = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#0a1a18] overflow-hidden">
      <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-full opacity-10"
              style={{
                transform: `rotate(${i * 45}deg)`,
                animation: `pulse-out 3s infinite ${i * 0.2}s`,
                background: `linear-gradient(90deg, transparent 0%, #114639 50%, transparent 100%)`,
              }}
            />
          ))}
        </div>

        {/* Rotating circles */}
        <div className="absolute inset-0 animate-spin-slow">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-customGreen"
              style={{
                top: "50%",
                left: "50%",
                opacity: 0.2 + i * 0.05,
                transform: `rotate(${i * 30}deg) translateY(-120px)`,
              }}
            />
          ))}
        </div>

        {/* Inner rotating element */}
        <div className="absolute w-40 h-40 animate-spin-reverse">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M50 10 A40 40 0 0 1 90 50 A40 40 0 0 1 50 90 A40 40 0 0 1 10 50 A40 40 0 0 1 50 10 Z"
              fill="none"
              stroke="#114639"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-30"
            />
          </svg>
        </div>

        {/* Main logo/icon */}
        <div className="relative z-10 w-32 h-32 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#114639"
              strokeWidth="3"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * progress) / 100}
              className="transition-all duration-1000 ease-out"
            />

            {/* Leaf shape */}
            <path
              d="M50 30 Q65 50 50 70 Q35 50 50 30"
              fill="#114639"
              className="origin-center animate-pulse-slow"
              style={{ opacity: progress / 100 }}
            />
          </svg>
        </div>

        {/* Text */}
        <div
          className="absolute bottom-0 left-0 right-0 text-center font-marcellus text-customGreen text-lg tracking-widest"
          style={{ opacity: progress / 100 }}
        >
          <div className="relative overflow-hidden h-8">
            <div className="animate-slide-up">
              <div className="h-8">LOADING</div>
              <div className="h-8">WELCOME</div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes pulse-out {
          0%, 100% { transform: rotate(${Math.random() * 360}deg) scale(0.8); opacity: 0.1; }
          50% { transform: rotate(${Math.random() * 360}deg) scale(1.2); opacity: 0.3; }
        }
        
        @keyframes slide-up {
          0%, 45% { transform: translateY(0); }
          50%, 95% { transform: translateY(-100%); }
          100% { transform: translateY(-100%); }
        }
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 12s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 4s ease-in-out infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}

export default CreativeLoading

