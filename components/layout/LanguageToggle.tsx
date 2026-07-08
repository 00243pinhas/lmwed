'use client';

import { useLocale, useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

type Props = {
  tone?: 'onLight' | 'onDark';
};

export function LanguageToggle({ tone = 'onLight' }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('languageSwitcher');

  const dividerColor = tone === 'onDark' ? 'text-white/30' : 'text-border-l';
  const activeColor = tone === 'onDark' ? 'text-white' : 'text-ink';
  const inactiveColor = tone === 'onDark' ? 'text-white/50 hover:text-white' : 'text-muted hover:text-ink';

  return (
    <div className="flex items-center gap-xs" aria-label={t('label')}>
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-xs">
          {i > 0 && (
            <span aria-hidden className={`font-body text-[10px] ${dividerColor}`}>
              /
            </span>
          )}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: loc })}
            aria-current={locale === loc}
            className={`font-body text-[10px] uppercase tracking-[0.1em] transition-colors duration-ui ease-standard ${
              locale === loc ? activeColor : inactiveColor
            }`}
          >
            {t(loc)}
          </button>
        </span>
      ))}
    </div>
  );
}
