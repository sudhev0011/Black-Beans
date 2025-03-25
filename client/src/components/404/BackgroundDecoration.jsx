import React from 'react';
import CoffeeBean from './CoffeeBean';

const BackgroundDecoration = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Coffee stains */}
      <div className="absolute -top-48 -left-48 w-96 h-96 coffee-stain opacity-10"></div>
      <div className="absolute top-1/3 -right-24 w-96 h-96 coffee-stain opacity-10"></div>
      <div className="absolute -bottom-48 left-1/4 w-96 h-96 coffee-stain opacity-10"></div>
      
      {/* Coffee beans scattered */}
      <CoffeeBean className="absolute top-20 left-20 opacity-10 animate-spin-slow" />
      <CoffeeBean className="absolute top-40 right-40 opacity-15 animate-spin-slow" />
      <CoffeeBean className="absolute bottom-20 left-1/3 opacity-10 animate-spin-slow" />
      <CoffeeBean className="absolute top-1/2 left-1/4 opacity-20 animate-float" />
      <CoffeeBean className="absolute top-1/3 right-1/3 opacity-15 animate-float" />
      <CoffeeBean className="absolute bottom-1/4 right-1/4 opacity-10 animate-float" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-coffee-light/5 to-coffee-cream/5"></div>
    </div>
  );
};

export default BackgroundDecoration;