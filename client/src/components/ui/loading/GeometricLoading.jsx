import { useEffect, useState } from "react"

const GeometricLoading = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#0a1a18]">
      <div className="relative w-64 h-64">
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-customGreen"
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
                animation: `float-around ${Math.random() * 10 + 5}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Geometric shapes */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Triangle */}
          <div className="absolute w-40 h-40 animate-spin-slow" style={{ animationDuration: "15s" }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,10 90,90 10,90" fill="none" stroke="#114639" strokeWidth="1" className="opacity-30" />
            </svg>
          </div>

          {/* Square */}
          <div className="absolute w-32 h-32 animate-spin-reverse" style={{ animationDuration: "12s" }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <rect
                x="20"
                y="20"
                width="60"
                height="60"
                fill="none"
                stroke="#114639"
                strokeWidth="1"
                className="opacity-40"
              />
            </svg>
          </div>

          {/* Hexagon */}
          <div className="absolute w-48 h-48 animate-spin-slow" style={{ animationDuration: "20s" }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,10 90,30 90,70 50,90 10,70 10,30"
                fill="none"
                stroke="#114639"
                strokeWidth="1"
                className="opacity-20"
              />
            </svg>
          </div>

          {/* Main circle */}
          <div className="absolute w-36 h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#114639" strokeWidth="2" className="opacity-80" />

              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#114639"
                strokeWidth="4"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress) / 100}
                className="transition-all duration-300 ease-out"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>

          {/* Center logo */}
          <div className="absolute w-20 h-20 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Diamond shape */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon points="50,10 90,50 50,90 10,50" fill="#114639" className="opacity-90" />
              </svg>

              {/* Pulsing inner circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-8 h-8 rounded-full bg-white dark:bg-[#0a1a18] animate-pulse-slow"
                  style={{ animationDuration: "2s" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Progress text */}
        <div className="absolute bottom-0 left-0 right-0 text-center font-marcellus text-customGreen">
          <div className="text-2xl font-bold tracking-widest">{progress}%</div>
          <div className="text-sm tracking-wider mt-1 opacity-70">LOADING</div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float-around {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, 10px) rotate(90deg); }
          50% { transform: translate(0, 20px) rotate(180deg); }
          75% { transform: translate(-20px, 10px) rotate(270deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
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
          0%, 100% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default GeometricLoading

