import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { background } from "@/assets/Banners";

const banners = [
  {
    id: 1,
    backgroundImage: background,
    title: "Start your day with a\ngood cup of coffee",
    subtitle: `Anyway, you still use Lorem Ipsum and rightly so, as it will always have a place in the web workers toolbox, as things happen, not always the way you like it, not always in the preferred order even if your less design.`,
    textPosition: 'left', 
  },
  {
    id: 2,
    backgroundImage: "/src/assets/Banners/Banner-02.jpg",
    title: "A cup of hot coffee is what\nyou need",
    subtitle: `How can you evaluate content without design? No typography, no colors, no layout, no styles, all those things that convey the important signals that beyond the mere textual, hierarchies of information, weight.`,
    textPosition: 'center', 
  },
  {
    id: 3,
    backgroundImage: "/src/assets/Banners/Banner-03.jpg",
    title: "Everything you need to\nknow about coffee",
    subtitle: `Settling you has separate supplied bed.Led all cottage met enabled attempt through talking delight.`,
    textPosition: 'left', 
  },
];

export default function HeroBanner() {      
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 10000); 

      return () => clearInterval(interval);
    }
  }, []);

  const banner = banners[currentBanner];

  return (
    <section className="relative overflow-hidden" style={{ height: "100vh" }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={banner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={banner.backgroundImage || "/placeholder.svg"}
            alt="Background"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-7xl h-full flex items-center justify-center">
        <div className="banner-content w-full flex justify-center h-full">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`hero flex flex-col justify-center text-${banner.textPosition} p-12 w-full`}
          >
            <h1 className="text-4xl font-bold tracking-tight text-[#114639] sm:text-5xl md:text-6xl whitespace-pre-line">
              {banner.title}
            </h1>
            <p
              className={`mt-4 text-xl text-[#767676]/90 max-w-3xl ${
                banner.textPosition === "center" ? "mx-auto" : "mr-auto"
              }`}
            >
              {banner.subtitle}
            </p>
            <div
              className={`banner-buttons mt-8 flex gap-4 ${
                banner.textPosition === "center" ? "justify-center" : "justify-start"
              }`}
            >
              <Button
                size="lg"
                className="hidden md:block border-1 border-[#C0C9C5] bg-transparent text-black hover:bg-white/90 hover:text-black rounded-full h-12"
                onClick={() => {
                  navigator.push("/shop");
                }}
              >
                SHOP NOW
              </Button>
              <Button
                size="lg"
                className="bg-[#114639] hover:bg-transparent hover:text-black text-white rounded-full h-12"
                onClick={() => {
                  navigator.push("/shop");
                }}
              >
                VIEW MORE
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
