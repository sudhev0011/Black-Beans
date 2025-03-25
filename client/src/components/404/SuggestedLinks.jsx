import React from 'react';
import { Link } from 'react-router-dom';

const SuggestedLinks = () => {
  const links = [
    { text: 'Coffee Beans', path: '/beans' },
    { text: 'Equipment', path: '/equipment' },
    { text: 'Brewing Guides', path: '/brewing-guides' }
  ];

  return (
    <div className="mt-10 opacity-0 animate-fade-in-delay-2">
      <h3 className="text-coffee-dark text-lg font-medium mb-3">Try exploring:</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className="px-4 py-2 rounded-lg bg-coffee-light text-coffee-dark hover:bg-coffee-cream transition-colors duration-200"
          >
            {link.text}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SuggestedLinks;