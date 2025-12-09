import React, { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-paper border-b border-carbon/10 sticky top-0 z-50 backdrop-blur-md bg-paper/90">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Brand */}
          <a href="/" className="font-sans text-2xl tracking-tighter text-carbon group">
            <span className="font-medium">Your</span>
            <span className="font-extrabold">HQ</span>
            <span className="text-signal group-hover:text-hibiscus transition-colors">.</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/how-it-works" className="text-sm font-medium text-carbon/70 hover:text-carbon transition-colors">How It Works</a>
            <a href="/pricing" className="text-sm font-medium text-carbon/70 hover:text-carbon transition-colors">Pricing</a>
            <a href="/work" className="text-sm font-medium text-carbon/70 hover:text-carbon transition-colors">Work</a>
            <a href="/blog" className="text-sm font-medium text-carbon/70 hover:text-carbon transition-colors">Blog</a>
            <a href="/our-story" className="text-sm font-medium text-carbon/70 hover:text-carbon transition-colors">Our Story</a>

            <a href="/contact" className="bg-carbon text-white px-6 py-2.5 text-sm font-bold tracking-wide hover:bg-signal transition-colors shadow-hard-sm hover:shadow-none hover:translate-y-[2px]">
              START BUILD
            </a>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-carbon p-2">
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block w-full h-0.5 bg-carbon transition-transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-full h-0.5 bg-carbon transition-opacity ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-full h-0.5 bg-carbon transition-transform ${isOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-paper border-b border-carbon/10 absolute w-full left-0 px-4 pt-2 pb-6 space-y-2 shadow-xl">
            <a href="/how-it-works" className="block py-3 text-lg font-bold text-carbon border-b border-carbon/5">How It Works</a>
            <a href="/pricing" className="block py-3 text-lg font-bold text-carbon border-b border-carbon/5">Pricing</a>
            <a href="/work" className="block py-3 text-lg font-bold text-carbon border-b border-carbon/5">Work</a>
            <a href="/blog" className="block py-3 text-lg font-bold text-carbon border-b border-carbon/5">Blog</a>
            <a href="/our-story" className="block py-3 text-lg font-bold text-carbon border-b border-carbon/5">Our Story</a>
            <a href="/contact" className="block mt-4 bg-signal text-white text-center py-4 font-bold uppercase tracking-wide">Start Your Build</a>
        </div>
      )}
    </nav>
  );
}