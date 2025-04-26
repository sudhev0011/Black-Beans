import { useEffect, useRef } from "react"
import { locationBean2 } from "@/assets/category"
import SVGComponent from '@/assets/category/svgviewer-react-output.jsx'

export default function AboutPage() {
  const pathRef = useRef(null)
  const logoRef = useRef(null)

  useEffect(() => {
    const path = pathRef.current
    const logo = logoRef.current

    if (!path || !logo) return

    // Get path length for calculations
    const pathLength = path.getTotalLength()

    // Function to position the logo along the path based on scroll
    const positionLogo = () => {
      // Calculate scroll progress (0 to 1)
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight
      const viewportHeight = window.innerHeight
      
      // Calculate scroll distance as percentage of scrollable content
      const scrollProgress = Math.min(
        scrollTop / (docHeight - viewportHeight),
        1
      )
      
      // Get point at current scroll position
      const point = path.getPointAtLength(scrollProgress * pathLength)

      // Position the logo at that point
      logo.style.transform = `translate(${point.x}px, ${point.y}px)`
    }

    // Initial position
    positionLogo()

    // Update on scroll
    window.addEventListener("scroll", positionLogo)

    // Clean up
    return () => {
      window.removeEventListener("scroll", positionLogo)
    }
  }, [])

  // Content data array - create content that matches the length of our path
  const contentSections = [
    {
      title: "Our Story",
      content: "Founded in 2010, our coffee journey began with a simple passion for exceptional beans and perfect brews. What started as a small roastery has grown into a community of coffee enthusiasts dedicated to bringing you the finest coffee experience.",
      position: "right"
    },
    {
      title: "Bean Selection",
      content: "We source our beans directly from sustainable farms across the globe. Each batch is carefully selected for its unique flavor profile and roasted to perfection in small batches to ensure quality and freshness.",
      position: "left"
    },
    {
      title: "Roasting Process",
      content: "Our master roasters bring decades of experience to every batch. Using a combination of traditional methods and modern technology, we develop unique roast profiles that highlight the natural characteristics of each bean.",
      position: "right"
    },
    {
      title: "Visit Us",
      content: "Stop by our café to experience our coffee firsthand. Our baristas are passionate about their craft and eager to guide you through our current selection of single-origin beans and signature blends.",
      position: "left"
    }
  ];

  return (
    <div className="relative min-h-screen bg-white">
      {/* Container for the SVG path and logo */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <svg className="w-full h-full">
          <path
            ref={pathRef}
            d="M700,250 
               C650,270 600,290 450,290
               C300,290 250,350 300,400
               C350,450 400,470 550,470
               C700,470 750,530 700,580
               C650,630 600,650 450,650
               C300,650 250,710 300,760
               C350,810 400,830 550,830
               C700,830 750,890 700,940
               C650,990 600,1010 450,1010
               C300,1010 250,1070 300,1120
               C350,1170 400,1190 550,1190
               C700,1190 750,1250 700,1300
               C650,1350 600,1370 450,1370
               C300,1370 250,1430 300,1480
               C350,1530 400,1550 550,1550
               C700,1550 750,1610 700,1660
               C650,1710 600,1730 450,1730
               C300,1730 250,1790 300,1840
               C350,1890 400,1910 550,1910
               C700,1910 750,1970 700,2020
               C650,2070 600,2090 450,2090"
            fill="none"
            stroke="#000000"
            strokeWidth="4"
            strokeDasharray="15,15"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Coffee bean logo that follows the path */}
        <div
          ref={logoRef}
          className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ zIndex: 2 }}
        >
          <SVGComponent/>
        </div>
      </div>

      {/* Page content with alternating left/right sections */}
      <div className="relative z-10 px-6 py-24 mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-16 text-customGreen text-center">About Our Coffee</h1>

        <div className="space-y-48 pb-32">
          {/* Map through content sections to generate alternating left/right cards */}
          {contentSections.map((section, index) => (
            <section 
              key={index}
              className={`max-w-lg bg-customGreen p-8 rounded-lg shadow-md ${
                section.position === "right" 
                  ? "ml-auto mr-8" 
                  : "mr-auto ml-8"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 text-white">{section.title}</h2>
              <p className="text-lg text-white">{section.content}</p>
            </section>
          ))}
          
          {/* Final section to ensure we can scroll to the bottom of the path */}
          <section className="ml-auto mr-8 max-w-lg bg-customGreen p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-white">Join Our Journey</h2>
            <p className="text-lg text-white">
              As we continue to grow and explore the rich world of coffee, we invite you to join us. Follow us on social media, sign up for our newsletter, or simply drop by for a cup. Your coffee journey is just beginning.
            </p>
          </section>
          
          {/* Extra padding at the bottom to ensure full scroll */}
          <div className="h-64"></div>
        </div>
      </div>
    </div>
  )
}





// import { useEffect, useRef } from "react"
// import SVGComponent from "@/assets/category/svgviewer-react-output.jsx"

// export default function AboutPage() {
//   const pathRef = useRef(null)
//   const progressPathRef = useRef(null)
//   const logoRef = useRef(null)

//   useEffect(() => {
//     const path = pathRef.current
//     const progressPath = progressPathRef.current
//     const logo = logoRef.current

//     if (!path || !logo || !progressPath) return

//     // Get path length for calculations
//     const pathLength = path.getTotalLength()

//     // Set up the progress path
//     progressPath.style.strokeDasharray = pathLength
//     progressPath.style.strokeDashoffset = pathLength

//     // Function to position the logo along the path based on scroll
//     const positionLogo = () => {
//       // Calculate scroll progress (0 to 1)
//       const scrollTop = window.scrollY
//       const docHeight = document.documentElement.scrollHeight
//       const viewportHeight = window.innerHeight

//       // Calculate scroll distance as percentage of scrollable content
//       const scrollProgress = Math.min(scrollTop / (docHeight - viewportHeight), 1)

//       // Get point at current scroll position
//       const point = path.getPointAtLength(scrollProgress * pathLength)

//       // Position the logo at that point
//       logo.style.transform = `translate(${point.x}px, ${point.y}px)`

//       // Update the progress path
//       const drawLength = pathLength * scrollProgress
//       progressPath.style.strokeDashoffset = pathLength - drawLength
//     }

//     // Initial position
//     positionLogo()

//     // Update on scroll
//     window.addEventListener("scroll", positionLogo)

//     // Clean up
//     return () => {
//       window.removeEventListener("scroll", positionLogo)
//     }
//   }, [])

//   // Content data array - create content that matches the length of our path
//   const contentSections = [
//     {
//       title: "Our Story",
//       content:
//         "Founded in 2010, our coffee journey began with a simple passion for exceptional beans and perfect brews. What started as a small roastery has grown into a community of coffee enthusiasts dedicated to bringing you the finest coffee experience.",
//       position: "right",
//     },
//     {
//       title: "Bean Selection",
//       content:
//         "We source our beans directly from sustainable farms across the globe. Each batch is carefully selected for its unique flavor profile and roasted to perfection in small batches to ensure quality and freshness.",
//       position: "left",
//     },
//     {
//       title: "Roasting Process",
//       content:
//         "Our master roasters bring decades of experience to every batch. Using a combination of traditional methods and modern technology, we develop unique roast profiles that highlight the natural characteristics of each bean.",
//       position: "right",
//     },
//     {
//       title: "Visit Us",
//       content:
//         "Stop by our café to experience our coffee firsthand. Our baristas are passionate about their craft and eager to guide you through our current selection of single-origin beans and signature blends.",
//       position: "left",
//     },
//   ]

//   return (
//     <div className="relative min-h-screen bg-white">
//       {/* Container for the SVG path and logo */}
//       <div className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
//         <svg className="w-full h-full">
//           {/* Background path (gray) */}
//           <path
//             ref={pathRef}
//             d="M700,250 
//                C650,270 600,290 450,290
//                C300,290 250,350 300,400
//                C350,450 400,470 550,470
//                C700,470 750,530 700,580
//                C650,630 600,650 450,650
//                C300,650 250,710 300,760
//                C350,810 400,830 550,830
//                C700,830 750,890 700,940
//                C650,990 600,1010 450,1010
//                C300,1010 250,1070 300,1120
//                C350,1170 400,1190 550,1190
//                C700,1190 750,1250 700,1300
//                C650,1350 600,1370 450,1370
//                C300,1370 250,1430 300,1480
//                C350,1530 400,1550 550,1550
//                C700,1550 750,1610 700,1660
//                C650,1710 600,1730 450,1730
//                C300,1730 250,1790 300,1840
//                C350,1890 400,1910 550,1910
//                C700,1910 750,1970 700,2020
//                C650,2070 600,2090 450,2090"
//             fill="none"
//             stroke="#E0E0E0"
//             strokeWidth="6"
//             strokeLinecap="round"
//           />

//           {/* Progress path (colored) that will fill as user scrolls */}
//           <path
//             ref={progressPathRef}
//             d="M700,250 
//                C650,270 600,290 450,290
//                C300,290 250,350 300,400
//                C350,450 400,470 550,470
//                C700,470 750,530 700,580
//                C650,630 600,650 450,650
//                C300,650 250,710 300,760
//                C350,810 400,830 550,830
//                C700,830 750,890 700,940
//                C650,990 600,1010 450,1010
//                C300,1010 250,1070 300,1120
//                C350,1170 400,1190 550,1190
//                C700,1190 750,1250 700,1300
//                C650,1350 600,1370 450,1370
//                C300,1370 250,1430 300,1480
//                C350,1530 400,1550 550,1550
//                C700,1550 750,1610 700,1660
//                C650,1710 600,1730 450,1730
//                C300,1730 250,1790 300,1840
//                C350,1890 400,1910 550,1910
//                C700,1910 750,1970 700,2020
//                C650,2070 600,2090 450,2090"
//             fill="none"
//             stroke="#5D8A68" // Using customGreen color
//             strokeWidth="6"
//             strokeLinecap="round"
//           />
//         </svg>

//         {/* Coffee bean logo that follows the path */}
//         <div
//           ref={logoRef}
//           className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
//           style={{ zIndex: 2 }}
//         >
//           <SVGComponent />
//         </div>
//       </div>

//       {/* Page content with alternating left/right sections */}
//       <div className="relative z-10 px-6 py-24 mx-auto max-w-6xl">
//         <h1 className="text-4xl font-bold mb-16 text-customGreen text-center">About Our Coffee</h1>

//         <div className="space-y-48 pb-32">
//           {/* Map through content sections to generate alternating left/right cards */}
//           {contentSections.map((section, index) => (
//             <section
//               key={index}
//               className={`max-w-lg bg-customGreen p-8 rounded-lg shadow-md ${
//                 section.position === "right" ? "ml-auto mr-8" : "mr-auto ml-8"
//               }`}
//             >
//               <h2 className="text-2xl font-semibold mb-4 text-white">{section.title}</h2>
//               <p className="text-lg text-white">{section.content}</p>
//             </section>
//           ))}

//           {/* Final section to ensure we can scroll to the bottom of the path */}
//           <section className="ml-auto mr-8 max-w-lg bg-customGreen p-8 rounded-lg shadow-md">
//             <h2 className="text-2xl font-semibold mb-4 text-white">Join Our Journey</h2>
//             <p className="text-lg text-white">
//               As we continue to grow and explore the rich world of coffee, we invite you to join us. Follow us on social
//               media, sign up for our newsletter, or simply drop by for a cup. Your coffee journey is just beginning.
//             </p>
//           </section>

//           {/* Extra padding at the bottom to ensure full scroll */}
//           <div className="h-64"></div>
//         </div>
//       </div>
//     </div>
//   )
// }



