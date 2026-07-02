import Link from 'next/link';

const navLinks = [
  { number: '01', label: 'Collections', href: '/collections' },
  { number: '02', label: 'Process', href: '/process' },
  { number: '03', label: 'About', href: '/about' },
  { number: '04', label: 'Inquire', href: '/inquire' },
];

const socialHandles = ['Instagram', 'TikTok', 'WhatsApp'];

export function Footer() {
  return (
    <footer className="bg-dark px-md py-3xl md:px-xl md:py-4xl">
      <div className="flex flex-col gap-2xl md:flex-row md:items-baseline md:justify-between">
        <p className="font-display text-display-xs font-light text-white">LM Weddyli</p>
        <p className="font-display italic text-display-2xs font-light text-accent">
          Chaque robe, une histoire.
        </p>
      </div>

      <nav
        aria-label="Footer"
        className="mt-2xl flex flex-col items-start gap-md md:mt-3xl md:flex-row md:items-center md:justify-center md:gap-xl"
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="cta-link font-body text-[9px] uppercase tracking-[0.1em] text-muted hover:text-white transition-colors duration-ui ease-standard"
          >
            {link.number} {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-2xl md:mt-3xl border-t border-hairline border-border-d pt-lg flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
        <div className="flex gap-lg">
          {socialHandles.map((handle) => (
            <span key={handle} className="font-body text-[9px] uppercase tracking-[0.1em] text-muted">
              {handle}
            </span>
          ))}
        </div>
        <p className="font-body text-[9px] uppercase tracking-[0.1em] text-muted">
          © {new Date().getFullYear()} LM Weddyli. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
