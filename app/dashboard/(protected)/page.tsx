'use client';

import { useDashboardUser } from '@/components/dashboard/DashboardShell';

export default function DashboardPage() {
  const { name, role } = useDashboardUser();

  return (
    <p className="font-display text-[22px] font-light text-ink">
      Logged in as {name} · role: {role}
    </p>
  );
}
