import { motion } from 'framer-motion';
import React from 'react';

const LoadingSkeleton = ({ isInline = false }) => {
  const circleCount = 8;
  const circles = Array.from({ length: circleCount });

  return (
    <div
      className={`flex flex-col items-center justify-center ${
        isInline
          ? 'w-full h-[400px] bg-transparent' // Match RelatedProducts carousel height
          : 'fixed inset-0 bg-white dark:bg-background'
      }`}
    >
      <div className="w-20 h-24 relative">
        {/* Spinning dots animation */}
        <div className="relative w-full h-full">
          {circles.map((_, index) => (
            <motion.div
              key={index}
              className="absolute w-3 h-3 bg-emerald-700 rounded-full"
              initial={{ opacity: 0 }}
              style={{
                top: '50%',
                left: '50%',
                margin: '-6px 0 0 -6px',
              }}
              animate={{
                x: Math.cos((index / circleCount) * Math.PI * 2) * 40,
                y: Math.sin((index / circleCount) * Math.PI * 2) * 40,
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: (index * 2) / circleCount,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Center pulsing element */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-4 h-4 bg-emerald-500 rounded-full"
            style={{ marginTop: '-8px', marginLeft: '-8px' }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7],
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Outer rotating ring */}
          <motion.div
            className="absolute inset-0 border-2 border-emerald-300 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      </div>

      {/* Animated text */}
      <div className="mt-12 relative">
        <motion.p
          className="font-marcellus text-customGreen text-lg"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          Loading related products
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingSkeleton;