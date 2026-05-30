import React, { useState } from 'react';

const navLinks = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/website-audit', label: 'Website Audit' },
  { href: '/who-we-build-for', label: 'Who We Build For' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/our-story', label: 'Our Story' },
];

const buildLink = '/start-build';

const grainBg = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
  backgroundSize: '180px 180px',
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-surface/95 border-b border-carbon/10 sticky top-0 z-50 backdrop-blur-md transition-all duration-300 shadow-subtle">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply"
        style={grainBg}
      />
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">

          <a href="/" className="flex items-center" aria-label="YourHQ home">
            <img src="/yourhq-logo-black.png" alt="YourHQ" className="h-12 w-auto" />
          </a>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-sans text-sm font-medium text-softGrey hover:text-carbon transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href={buildLink}
              className="bg-carbon text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-deepGreen transition-colors shadow-subtle hover:shadow-elegant"
            >
              Start Your Build
            </a>
          </div>

          {/* MOBILE TOGGLE BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-carbon p-2"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block w-full h-[2px] bg-carbon transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-[9px]' : ''}`}></span>
              <span className={`block w-full h-[2px] bg-carbon transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-full h-[2px] bg-carbon transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div
        className={`lg:hidden bg-surface border-b border-carbon/10 absolute w-full left-0 px-6 pb-8 shadow-elegant transition-all duration-300 origin-top overflow-hidden ${
          isOpen ? 'max-h-[500px] py-4 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col space-y-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setIsOpen(false)}
              className="block py-3 font-display font-bold text-lg sm:text-xl uppercase tracking-tight text-carbon border-b border-carbon/5 hover:text-terracotta transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href={buildLink}
            onClick={() => setIsOpen(false)}
            className="block mt-6 bg-carbon text-white text-center py-4 rounded-full font-medium text-sm hover:bg-deepGreen transition-colors shadow-subtle"
          >
            Start Your Build
          </a>
        </div>
      </div>
    </nav>
  );
}
