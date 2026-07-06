'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { logout } from '@/app/dashboard/actions';

type DashboardUser = { name: string; role: string };

const DashboardUserContext = createContext<DashboardUser | null>(null);

export function useDashboardUser(): DashboardUser {
  const ctx = useContext(DashboardUserContext);
  if (!ctx) throw new Error('useDashboardUser must be used within DashboardShell');
  return ctx;
}

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', ownerOnly: false },
  { label: 'Rentals', href: '/dashboard/rentals', ownerOnly: false },
  { label: 'Dresses', href: '/dashboard/dresses', ownerOnly: false },
  { label: 'Orders', href: '/dashboard/orders', ownerOnly: true },
  { label: 'Staff', href: '/dashboard/staff', ownerOnly: true },
];

function sectionTitle(pathname: string) {
  return NAV_ITEMS.find((item) => item.href === pathname)?.label ?? 'Overview';
}

export function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // UI hiding for clarity only — every owner-only route is also enforced
  // server-side (see skills/backend-auth.md, skills/dashboard-design.md).
  const navItems = NAV_ITEMS.filter((item) => !item.ownerOnly || user.role === 'owner');

  return (
    <DashboardUserContext.Provider value={user}>
      <div className="min-h-screen bg-light md:flex">
        {/* Sidebar — tablet/desktop */}
        <aside className="hidden md:flex md:w-[200px] md:shrink-0 md:flex-col md:justify-between md:border-r-hairline md:border-border-d bg-dark px-lg py-lg md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <div>
            <p className="font-body text-[13px] uppercase tracking-[0.1em] text-white">
              LM Weddyli
            </p>
            <p className="font-body text-[10px] uppercase tracking-[0.14em] text-accent mt-xs">
              Dashboard
            </p>
            <nav className="mt-2xl flex flex-col gap-xs">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`font-body text-[12px] uppercase tracking-[0.08em] px-sm py-sm transition-colors duration-ui ease-standard ${
                      active ? 'text-white bg-white/10' : 'text-accent hover:text-white'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-col gap-sm">
            <p className="font-body text-[11px] text-accent">
              {user.name} · {user.role}
            </p>
            <form action={logout}>
              <button
                type="submit"
                className="cta-link font-body text-[11px] uppercase tracking-[0.1em] text-white"
              >
                Log Out
              </button>
            </form>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center justify-between border-b-hairline border-border-l px-lg py-md md:px-xl">
            <div className="flex items-center gap-md">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                className="md:hidden font-body text-[16px] text-ink min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ☰
              </button>
              <p className="font-display text-[16px] tracking-[0.08em] text-ink md:hidden">
                LM WEDDYLI
              </p>
              <p className="hidden md:block font-body text-[13px] uppercase tracking-[0.1em] text-ink">
                {sectionTitle(pathname)}
              </p>
            </div>
            <p className="hidden md:block font-body text-[11px] text-muted">
              Logged in as {user.name} · {user.role}
            </p>
          </header>

          {menuOpen && (
            <nav className="md:hidden flex flex-col border-b-hairline border-border-l bg-white">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`font-body text-[12px] uppercase tracking-[0.08em] px-lg py-md border-b-hairline border-border-l min-h-[44px] flex items-center ${
                    pathname === item.href ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <p className="font-body text-[11px] text-muted px-lg py-sm">
                Logged in as {user.name} · {user.role}
              </p>
              <form action={logout} className="px-lg py-md">
                <button
                  type="submit"
                  className="cta-link font-body text-[11px] uppercase tracking-[0.1em] text-ink"
                >
                  Log Out
                </button>
              </form>
            </nav>
          )}

          <main className="flex-1 px-lg py-xl md:px-xl md:py-2xl">{children}</main>
        </div>
      </div>
    </DashboardUserContext.Provider>
  );
}
