import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HeroBanner = () => {
  const imageRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const image = imageRef.current;
    const section = sectionRef.current;

    gsap.fromTo(
      image,
      {
        width: '100vw',
        height: '100vh',
        top: 0,
        left: '50%',
        xPercent: -50,
      },
      {
        width: '200px',
        height: '100px',
        top: '30px',
        left: '50%',
        xPercent: -50,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=400',
          scrub: true,
          pin: true,
          pinSpacing: true,
        },
      }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <img
        ref={imageRef}
        src="/src/assets/Banners/Banner-03.jpg"
        alt="Hero"
        style={{
          position: 'absolute',
          objectFit: 'cover',
          width: '100vw',
          height: '100vh',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </section>
  );
};

export default HeroBanner;
