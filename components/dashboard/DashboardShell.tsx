'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { logout } from '@/app/dashboard/actions';

type DashboardUser = { name: string; role: string };

const DashboardUserContext = createContext<DashboardUser | null>(null);

export function useDashboardUser(): DashboardUser {
  const ctx = useContext(DashboardUserContext);
  if (!ctx) throw new Error('useDashboardUser must be used within DashboardShell');
  return ctx;
}

export function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: ReactNode;
}) {
  return (
    <DashboardUserContext.Provider value={user}>
      <div className="min-h-screen bg-light">
        <header className="flex items-center justify-between border-b-hairline border-border-l px-lg py-md md:px-4xl">
          <p className="font-display text-[16px] tracking-[0.08em] text-ink">LM WEDDYLI — DASHBOARD</p>
          <form action={logout}>
            <button
              type="submit"
              className="cta-link font-body text-[11px] uppercase tracking-[0.1em] text-ink"
            >
              Log Out
            </button>
          </form>
        </header>
        <main className="px-lg py-2xl md:px-4xl">{children}</main>
      </div>
    </DashboardUserContext.Provider>
  );
}
