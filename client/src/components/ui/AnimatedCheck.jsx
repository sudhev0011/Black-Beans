import React from "react";
import { motion } from "framer-motion";

// Animation variants for the checkmark
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
 * Animated checkmark component with customizable properties
 * 
 * @param {Object} props - Component props
 * @param {number} props.size - Size of the checkmark SVG (default: 100)
 * @param {number} props.strokeWidth - Width of the stroke (default: 2)
 * @param {string} props.color - Color of the checkmark (default: "currentColor")
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.withGlow - Whether to show glow effect (default: false)
 * @param {string} props.glowColor - Color of the glow effect (default: dependent on color)
 * @returns {React.ReactElement} Animated checkmark component
 */
const AnimatedCheckmark = ({
  size = 100,
  strokeWidth = 2,
  color = "currentColor",
  className = "",
  withGlow = false,
  glowColor = "",
  ...rest
}) => {
  // Default glow color based on the checkmark color if not specified
  const defaultGlowColor = color === "rgb(16 185 129)" || color === "rgb(22 163 74)" 
    ? "bg-green-500/10 dark:bg-green-500/20"
    : color === "rgb(59 130 246)" || color.includes("blue")
    ? "bg-blue-500/10 dark:bg-blue-500/20"
    : "bg-emerald-500/10 dark:bg-emerald-500/20";

  const actualGlowColor = glowColor || defaultGlowColor;

  const checkmarkSvg = (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
      className={className}
      {...rest}
    >
      <title>Animated Checkmark</title>
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
        d="M30 50L45 65L70 35"
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
    </motion.svg>
  );

  // If glow effect is not needed, return just the SVG
  if (!withGlow) {
    return checkmarkSvg;
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
          {checkmarkSvg}
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedCheckmark;