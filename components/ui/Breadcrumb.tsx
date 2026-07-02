import Link from 'next/link';

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="px-md pt-20 pb-md md:px-xl md:pt-24 md:pb-lg">
      <ol className="flex flex-wrap items-center gap-xs font-body text-[10px] uppercase tracking-[0.1em] text-muted">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-xs">
            {i > 0 && <span aria-hidden>/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="cta-link hover:text-ink transition-colors duration-ui ease-standard"
              >
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
