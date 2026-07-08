import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

export function Footer() {
  const tNav = useTranslations('nav');
  const t = useTranslations('footer');

  const navLinks = [
    { number: '01', label: tNav('collections'), href: '/collections' as const },
    { number: '02', label: tNav('process'), href: '/process' as const },
    { number: '03', label: tNav('about'), href: '/about' as const },
    { number: '04', label: tNav('inquire'), href: '/inquire' as const },
  ];

  const socialHandles = [t('instagram'), t('tiktok'), t('whatsapp')];

  return (
    <footer className="bg-dark px-md py-3xl md:px-xl md:py-4xl">
      <div className="flex flex-col gap-2xl md:flex-row md:items-baseline md:justify-between">
        <p className="font-display text-display-xs font-light text-white">LM Weddyli</p>
        <p className="font-display italic text-display-2xs font-light text-accent">{t('tagline')}</p>
      </div>

      <nav
        aria-label={t('footerLabel')}
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
          {t('copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
