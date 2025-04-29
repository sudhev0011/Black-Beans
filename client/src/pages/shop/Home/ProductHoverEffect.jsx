import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FeaturedProductCard } from "./FeaturedProductCard";

export const ProductHoverEffect = ({ items, className }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={cn(
            "relative group block h-full w-full rounded-2xl transition-all duration-300",
            hoveredIndex === idx ? "ring-4 ring-primary/50" : ""
          )}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-primary/30 dark:bg-slate-800/[0.8] block rounded-2xl -z-3"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <div className="relative z-10">
            <FeaturedProductCard
              id={item.id}
              title={item.title}
              category={item.category}
              imageUrl={item.imageUrl}
              actualPrice={item.actualPrice}
              salePrice={item.salePrice}
            />
          </div>
        </div>
      ))}
    </div>
  );
};