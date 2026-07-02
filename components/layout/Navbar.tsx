'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const primaryLinks = [
  { number: '01', label: 'Collections', href: '/collections' },
  { number: '02', label: 'Process', href: '/process' },
];

const secondaryLinks = [{ number: '03', label: 'About', href: '/about' }];

const ease = [0.16, 1, 0.3, 1] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-14 md:h-[60px] flex items-center justify-between px-md md:px-xl transition-[background-color,backdrop-filter] duration-ui ease-standard ${
          scrolled ? 'bg-light/[0.92] backdrop-blur-sm' : 'bg-transparent'
        }`}
      >
        <nav className="hidden md:flex items-center gap-lg" aria-label="Primary">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`cta-link font-body text-nav uppercase transition-colors duration-ui ease-standard ${
                scrolled ? 'text-muted hover:text-ink' : 'text-white/80 hover:text-white'
              }`}
            >
              {link.number} {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className={`font-display text-[16px] tracking-[0.08em] absolute left-1/2 -translate-x-1/2 transition-colors duration-ui ease-standard ${
            scrolled ? 'text-ink' : 'text-white'
          }`}
        >
          LM WEDDYLI
        </Link>

        <nav className="hidden md:flex items-center gap-lg" aria-label="Secondary">
          {secondaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`cta-link font-body text-nav uppercase transition-colors duration-ui ease-standard ${
                scrolled ? 'text-muted hover:text-ink' : 'text-white/80 hover:text-white'
              }`}
            >
              {link.number} {link.label}
            </Link>
          ))}
          <Link
            href="/inquire"
            className={`font-body text-nav uppercase border border-hairline px-md py-xs transition-colors duration-ui ease-standard ${
              scrolled
                ? 'text-ink border-ink hover:bg-ink hover:text-white'
                : 'text-white border-white hover:bg-white hover:text-ink'
            }`}
          >
            04 Inquire →
          </Link>
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden ml-auto flex h-11 w-11 flex-col items-center justify-center gap-[5px]"
        >
          <span
            className={`block h-[0.5px] w-5 transition-transform duration-ui ease-standard ${
              scrolled && !menuOpen ? 'bg-ink' : 'bg-white'
            } ${menuOpen ? 'translate-y-[5.5px] rotate-45' : ''}`}
          />
          <span
            className={`block h-[0.5px] w-5 transition-transform duration-ui ease-standard ${
              scrolled && !menuOpen ? 'bg-ink' : 'bg-white'
            } ${menuOpen ? '-rotate-45' : ''}`}
          />
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { y: '-100%' }}
            animate={{ y: 0, opacity: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { y: '-100%' }}
            transition={{ duration: prefersReduced ? 0 : 0.35, ease }}
            className="fixed inset-0 z-[100] bg-dark flex flex-col items-center justify-center gap-xl md:hidden"
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute top-0 right-0 flex h-14 w-14 items-center justify-center text-white"
            >
              <span className="relative block h-[0.5px] w-5 bg-white rotate-45" />
              <span className="absolute block h-[0.5px] w-5 bg-white -rotate-45" />
            </button>

            {[...primaryLinks, ...secondaryLinks, { number: '04', label: 'Inquire', href: '/inquire' }].map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-display text-display-xs font-light text-white"
                >
                  {link.label}
                </Link>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
