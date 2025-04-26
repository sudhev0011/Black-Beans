// import React, { useEffect, useState, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { motion, AnimatePresence, useInView, useAnimation } from 'framer-motion';

// const DecorativeSection = ({ productsData }) => {
//   const [activeSection, setActiveSection] = useState(0);
//   const sectionRef = useRef(null);
//   const inView = useInView(sectionRef, { once: false, amount: 0.3 });
//   const controls = useAnimation();

//   // Content sections data
//   const sections = [
//     {
//       title: "Crafted with Passion",
//       description: "At Black Beans, we believe that great coffee is an art form. From carefully selecting the finest beans to perfecting the roasting process, we're dedicated to bringing you exceptional coffee experiences.",
//       buttonText: "Our Story",
//       images: [
//         productsData?.products[3]?.images[0],
//         productsData?.products[6]?.images[0]
//       ]
//     },
//     {
//       title: "Sustainably Sourced",
//       description: "We work directly with farmers who share our commitment to quality and sustainability. By building lasting relationships with our growers, we ensure fair practices and superior beans for your perfect cup.",
//       buttonText: "Our Process",
//       images: [
//         productsData?.products[1]?.images[0],
//         productsData?.products[8]?.images[0]
//       ]
//     }
//   ];

//   // Animation variants
//   const textVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { 
//       opacity: 1, 
//       y: 0,
//       transition: { 
//         duration: 0.8,
//         staggerChildren: 0.2 
//       }
//     }
//   };

//   // Image animation variants with smoother transitions
//   const imageContainerVariants = {
//     hidden: { opacity: 0 },
//     visible: { 
//       opacity: 1,
//       transition: { duration: 0.5 }
//     },
//   };
  
//   const imageVariants = {
//     hidden: { opacity: 0, scale: 0.95 },
//     visible: { 
//       opacity: 1, 
//       scale: 1,
//       transition: { duration: 0.8 }
//     },
//     exit: {
//       opacity: 0,
//       scale: 0.95,
//       transition: { duration: 0.5 }
//     }
//   };

//   // Listen for scroll position to trigger section change
//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollY = window.scrollY;
//       const viewportHeight = window.innerHeight;
      
//       // Calculate which section to show based on scroll position
//       const newSection = Math.floor(scrollY / (viewportHeight * 0.5)) % sections.length;
      
//       if (newSection !== activeSection) {
//         setActiveSection(newSection);
//         controls.start("visible");
//       }
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, [activeSection, controls, sections.length]);

//   // Trigger animation when section comes into view
//   useEffect(() => {
//     if (inView) {
//       controls.start("visible");
//     } else {
//       controls.start("hidden");
//     }
//   }, [controls, inView, activeSection]);

//   const currentSection = sections[activeSection];

//   return (
//     <section className="py-20 bg-[#f8f5f2]" ref={sectionRef}>
//       <div className="container mx-auto px-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
//           <motion.div
//             initial="hidden"
//             animate={controls}
//             variants={textVariants}
//           >
//             <motion.h1 className="text-3xl font-bold mb-6" variants={textVariants}>
//               {currentSection.title}
//             </motion.h1>
//             <motion.p className="text-muted-foreground mb-6" variants={textVariants}>
//               {currentSection.description}
//             </motion.p>
//             <motion.div variants={textVariants}>
//               <Button variant="outline">{currentSection.buttonText}</Button>
//             </motion.div>
//           </motion.div>
          
//           <div className="relative h-72 md:h-96">
//             <AnimatePresence mode="wait">
//               <motion.div 
//                 key={`images-section-${activeSection}`}
//                 className="grid grid-cols-2 gap-4 absolute w-full"
//                 initial="hidden"
//                 animate="visible"
//                 exit="exit"
//                 variants={imageContainerVariants}
//               >
//                 <motion.div variants={imageVariants}>
//                   <img
//                     src={currentSection.images[0]}
//                     alt="Coffee product"
//                     className="rounded-lg shadow-md w-full h-full object-cover"
//                   />
//                 </motion.div>
//                 <motion.div variants={imageVariants} className="mt-8">
//                   <img
//                     src={currentSection.images[1]}
//                     alt="Coffee product"
//                     className="rounded-lg shadow-md w-full h-full object-cover"
//                   />
//                 </motion.div>
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default DecorativeSection;














import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, useInView, useAnimation } from 'framer-motion';

const DecorativeSection = ({ productsData }) => {
  const [activeSection, setActiveSection] = useState(0);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.3 });
  const controls = useAnimation();

  // Content sections data
  const sections = [
    {
      title: "Crafted with Passion",
      description: "At Black Beans, we believe that great coffee is an art form. From carefully selecting the finest beans to perfecting the roasting process, we're dedicated to bringing you exceptional coffee experiences.",
      buttonText: "Our Story",
      images: [
        productsData?.products[3]?.images[0],
        productsData?.products[6]?.images[0]
      ]
    },
    {
      title: "Sustainably Sourced",
      description: "We work directly with farmers who share our commitment to quality and sustainability. By building lasting relationships with our growers, we ensure fair practices and superior beans for your perfect cup.",
      buttonText: "Our Process",
      images: [
        productsData?.products[1]?.images[0],
        productsData?.products[8]?.images[0]
      ]
    }
  ];

  // Animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.2 
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.3 
      }
    }
  };

  // Listen for scroll position to trigger section change
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      // Calculate which section to show based on scroll position
      const newSection = Math.floor(scrollY / (viewportHeight * 0.5)) % sections.length;
      
      if (newSection !== activeSection) {
        setActiveSection(newSection);
        controls.start("visible");
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, controls, sections.length]);

  // Trigger animation when section comes into view
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView, activeSection]);

  const currentSection = sections[activeSection];

  return (
    <section className="py-20 bg-[#f8f5f2]" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial="hidden"
            animate={controls}
            variants={textVariants}
          >
            <motion.h1 className="text-3xl font-bold mb-6" variants={textVariants}>
              {currentSection.title}
            </motion.h1>
            <motion.p className="text-muted-foreground mb-6" variants={textVariants}>
              {currentSection.description}
            </motion.p>
            <motion.div variants={textVariants}>
              <Button variant="outline">{currentSection.buttonText}</Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial="hidden"
            animate={controls}
            variants={imageVariants}
          >
            <motion.img
              src={currentSection.images[0]}
              alt="Coffee product"
              className="rounded-lg shadow-md"
              variants={imageVariants}
            />
            <motion.img
              src={currentSection.images[1]}
              alt="Coffee product"
              className="rounded-lg shadow-md mt-8"
              variants={imageVariants}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DecorativeSection;















// import React, { useEffect, useState, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { motion, useInView, useAnimation } from 'framer-motion';

// const DecorativeSection = ({ productsData }) => {
//   const [activeSection, setActiveSection] = useState(0);
//   const [isHovered, setIsHovered] = useState(false);
//   const sectionRef = useRef(null);
//   const inView = useInView(sectionRef, { once: false, amount: 0.3 });
//   const controls = useAnimation();

//   // Content sections data
//   const sections = [
//     {
//       title: "Crafted with Passion",
//       description: "At Black Beans, we believe that great coffee is an art form. From carefully selecting the finest beans to perfecting the roasting process, we're dedicated to bringing you exceptional coffee experiences.",
//       buttonText: "Our Story",
//       images: [
//         productsData?.products[3].images[0],
//         productsData?.products[6].images[0]
//       ]
//     },
//     {
//       title: "Sustainably Sourced",
//       description: "We work directly with farmers who share our commitment to quality and sustainability. By building lasting relationships with our growers, we ensure fair practices and superior beans for your perfect cup.",
//       buttonText: "Our Process",
//       images: [
//         productsData?.products[1]?.images[0],
//         productsData?.products[8]?.images[0]
//       ]
//     }
//   ];

//   // Animation variants
//   const textVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { 
//       opacity: 1, 
//       y: 0,
//       transition: { 
//         duration: 0.8,
//         staggerChildren: 0.2 
//       }
//     }
//   };

//   const imageVariants = {
//     hidden: { opacity: 0, scale: 0.9 },
//     visible: { 
//       opacity: 1, 
//       scale: 1,
//       transition: { 
//         duration: 0.8,
//         staggerChildren: 0.3 
//       }
//     }
//   };

//   // Listen for scroll position to trigger section change
//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollY = window.scrollY;
//       const viewportHeight = window.innerHeight;
      
//       // Calculate which section to show based on scroll position
//       const newSection = Math.floor(scrollY / (viewportHeight * 0.5)) % sections.length;
      
//       if (newSection !== activeSection) {
//         setActiveSection(newSection);
//         controls.start("visible");
//       }
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, [activeSection, controls, sections.length]);

//   // Trigger animation when section comes into view
//   useEffect(() => {
//     if (inView) {
//       controls.start("visible");
//     } else {
//       controls.start("hidden");
//     }
//   }, [controls, inView, activeSection]);

//   const currentSection = sections[activeSection];

//   return (
//     <section className="py-20 bg-[#f8f5f2]" ref={sectionRef}>
//       <div className="container mx-auto px-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
//           <motion.div
//             initial="hidden"
//             animate={controls}
//             variants={textVariants}
//           >
//             <motion.h1 className="text-3xl font-bold mb-6" variants={textVariants}>
//               {currentSection.title}
//             </motion.h1>
//             <motion.p className="text-muted-foreground mb-6" variants={textVariants}>
//               {currentSection.description}
//             </motion.p>
//             <motion.div variants={textVariants}>
//               <Button variant="outline">{currentSection.buttonText}</Button>
//             </motion.div>
//           </motion.div>
          
//           <motion.div 
//             className="grid grid-cols-1 gap-4 relative h-screen"
//             initial="hidden"
//             animate={controls}
//             variants={imageVariants}
//             onHoverStart={() => setIsHovered(true)}
//             onHoverEnd={() => setIsHovered(false)}
//           >
//             <motion.div 
//               className="absolute w-full h-full"
//               style={{ perspective: "1000px" }}
//             >
//               <motion.img
//                 src={currentSection.images[0]}
//                 alt="Coffee product"
//                 className="rounded-lg shadow-md absolute w-1/2 h-4/5 object-cover"
//                 style={{
//                   left: isHovered ? "50%" : "0",
//                   top: isHovered ? "20%" : "0",
//                   zIndex: isHovered ? 1 : 2,
//                   transition: "all 0.75s cubic-bezier(0.68, -0.6, 0.32, 1.6)"
//                 }}
//               />
//               <motion.img
//                 src={currentSection.images[1]}
//                 alt="Coffee product"
//                 className="rounded-lg shadow-md absolute w-1/2 h-4/5 object-cover"
//                 style={{
//                   left: isHovered ? "0" : "50%",
//                   top: isHovered ? "0" : "20%", 
//                   zIndex: isHovered ? 2 : 1,
//                   transition: "all 0.75s cubic-bezier(0.68, -0.6, 0.32, 1.6)"
//                 }}
//               />
//             </motion.div>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default DecorativeSection;