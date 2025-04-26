const LoadingAlternative = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-background">
        <div className="flex flex-col items-center gap-4">
          {/* Pulsing circles */}
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-3 w-3 rounded-full bg-customGreen opacity-75 animate-pulse"
                style={{
                  animationDelay: `${index * 0.3}s`,
                  animationDuration: "1.5s",
                }}
              ></div>
            ))}
          </div>
  
          {/* Loading text */}
          <p className="font-marcellus text-customGreen">Loading</p>
        </div>
      </div>
    )
  }
  
  export default LoadingAlternative
  
  