import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, Package } from "lucide-react";

const EmptyCartComponent = ({ onContinueShopping }) => {
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    // Show suggestion after 1.5 seconds
    const timer = setTimeout(() => {
      setShowSuggestion(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const floatVariants = {
    float: {
      y: [0, -15, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  const spinVariants = {
    spin: {
      rotate: [0, 360],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <motion.div 
      className="px-4 text-center"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="relative h-40 w-40 mx-auto mb-6"
        variants={itemVariants}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate="float"
          variants={floatVariants}
        >
          <ShoppingBag className="h-24 w-24 text-gray-300" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          animate="spin"
          variants={spinVariants}
        >
        </motion.div>
      </motion.div>

      <motion.h2 
        className="text-2xl font-bold mb-3"
        variants={itemVariants}
      >
        Your Cart is Empty
      </motion.h2>
      
      <motion.p 
        className="text-gray-500 mb-6 max-w-md mx-auto"
        variants={itemVariants}
      >
        Looks like you haven't discovered your perfect items yet. Start filling your cart with amazing products!
      </motion.p>
      
      <motion.div variants={itemVariants}>
        <Button 
          size="lg"
          onClick={onContinueShopping}
          className="bg-primary hover:bg-primary/90 text-white px-6"
        >
          Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>

      {showSuggestion && (
        <motion.div
          className="mt-5 p-6 bg-gray-50 rounded-lg max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Package className="h-8 w-8 mb-3 text-primary mx-auto" />
          <h3 className="font-medium text-lg mb-2">Recommended for You</h3>
          <p className="text-gray-600 mb-4">Check out our trending items and special deals available right now!</p>
          <Button 
            variant="outline" 
            onClick={onContinueShopping}
            className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          >
            Explore Deals
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyCartComponent;