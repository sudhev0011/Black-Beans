import React from "react";
import { motion } from "framer-motion";

// Animation variants for the error X
const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        delay: i * 0.3,
        type: "spring",
        duration: 1.5,
        bounce: 0.2,
        ease: "easeInOut",
      },
      opacity: { delay: i * 0.2, duration: 0.2 },
    },
  }),
};

/**
 * Animated error X component with customizable properties
 * 
 * @param {Object} props - Component props
 * @param {number} props.size - Size of the error SVG (default: 100)
 * @param {number} props.strokeWidth - Width of the stroke (default: 2)
 * @param {string} props.color - Color of the error mark (default: "currentColor")
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.withGlow - Whether to show glow effect (default: false)
 * @param {string} props.glowColor - Color of the glow effect (default: dependent on color)
 * @returns {React.ReactElement} Animated error component
 */
const AnimatedError = ({
  size = 100,
  strokeWidth = 2,
  color = "currentColor",
  className = "",
  withGlow = false,
  glowColor = "",
  ...rest
}) => {
  // Default glow color based on the error color if not specified
  const defaultGlowColor = color === "rgb(220 38 38)" || color === "rgb(239 68 68)" 
    ? "bg-red-500/10 dark:bg-red-500/20"
    : color === "rgb(249 115 22)" || color.includes("orange")
    ? "bg-orange-500/10 dark:bg-orange-500/20"
    : "bg-red-500/10 dark:bg-red-500/20";

  const actualGlowColor = glowColor || defaultGlowColor;

  const errorSvg = (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
      className={className}
      {...rest}
    >
      <title>Animated Error</title>
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        stroke={color}
        variants={draw}
        custom={0}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          fill: "transparent",
        }}
      />
      <motion.path
        d="M35 35L65 65"
        stroke={color}
        variants={draw}
        custom={1}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "transparent",
        }}
      />
      <motion.path
        d="M65 35L35 65"
        stroke={color}
        variants={draw}
        custom={1.3}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "transparent",
        }}
      />
    </motion.svg>
  );

  // If glow effect is not needed, return just the SVG
  if (!withGlow) {
    return errorSvg;
  }

  return (
    <motion.div
      className="flex justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        scale: {
          type: "spring",
          damping: 15,
          stiffness: 200,
        },
      }}
    >
      <div className="relative">
        <motion.div
          className={`absolute inset-0 blur-xl rounded-full ${typeof actualGlowColor === 'string' && !actualGlowColor.startsWith('bg-') ? '' : actualGlowColor}`}
          style={typeof actualGlowColor === 'string' && !actualGlowColor.startsWith('bg-') ? { backgroundColor: actualGlowColor } : {}}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeOut",
          }}
        />
        <div className="relative z-10 dark:drop-shadow-[0_0_10px_rgba(0,0,0,0.1)]">
          {errorSvg}
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedError;