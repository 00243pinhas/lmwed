'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { StatusPill } from '@/components/dashboard/StatusPill';
import type { StaffMember } from '@/types/staff';

const ACTION_BUTTON_CLASS =
  'min-h-[44px] px-md bg-dark text-white rounded-sm font-body text-[12px] uppercase tracking-[0.08em] disabled:opacity-50';
const SECONDARY_BUTTON_CLASS =
  'min-h-[44px] px-md border-hairline border-border-l text-ink rounded-sm font-body text-[12px] uppercase tracking-[0.08em] disabled:opacity-50';

function StaffAction({ staff, currentUserId }: { staff: StaffMember; currentUserId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (staff.role === 'owner' || staff.id === currentUserId) {
    return <span className="font-body text-[12px] text-muted">—</span>;
  }

  async function handleToggle() {
    setSubmitting(true);
    setError(null);
    try {
      const endpoint = staff.active ? '/api/staff/deactivate' : '/api/staff/reactivate';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: staff.id }),
      });
      const result = await res.json();

      if (!result.ok) {
        setError(result.error ?? 'Could not update staff member');
        return;
      }

      setConfirming(false);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!staff.active) {
    return (
      <button type="button" onClick={handleToggle} disabled={submitting} className={ACTION_BUTTON_CLASS}>
        {submitting ? 'Reactivating…' : 'Reactivate'}
      </button>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="min-h-[44px] px-md bg-alert-bg text-alert rounded-sm font-body text-[12px] uppercase tracking-[0.08em]"
      >
        Deactivate
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-xs items-start">
      <div className="flex flex-wrap items-center gap-xs">
        <span className="font-body text-[12px] text-ink">Sure?</span>
        <button type="button" onClick={handleToggle} disabled={submitting} className={ACTION_BUTTON_CLASS}>
          {submitting ? 'Deactivating…' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={submitting}
          className={SECONDARY_BUTTON_CLASS}
        >
          Cancel
        </button>
      </div>
      {error && (
        <p className="font-body text-[12px] text-alert bg-alert-bg rounded-sm px-sm py-xs">{error}</p>
      )}
    </div>
  );
}

export function StaffTable({
  staff,
  currentUserId,
}: {
  staff: StaffMember[];
  currentUserId: string;
}) {
  if (staff.length === 0) {
    return <p className="font-body text-[14px] text-muted">No staff yet. Add the first one below.</p>;
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto rounded-sm border-hairline border-border-l bg-white shadow-card">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-hairline border-border-l">
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Name
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Email
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Role
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Status
              </th>
              <th className="px-lg py-sm font-body text-[11px] uppercase tracking-[0.06em] text-muted">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr
                key={member.id}
                className="border-b-hairline border-border-l last:border-b-0 hover:bg-light transition-colors duration-ui ease-standard"
              >
                <td className="px-lg py-md font-body text-[14px] text-ink">{member.name}</td>
                <td className="px-lg py-md font-body text-[14px] text-ink">{member.email}</td>
                <td className="px-lg py-md font-body text-[14px] text-ink capitalize">{member.role}</td>
                <td className="px-lg py-md">
                  <StatusPill label={member.active ? 'Active' : 'Inactive'} tone={member.active ? 'ok' : 'muted'} />
                </td>
                <td className="px-lg py-md">
                  <StaffAction staff={member} currentUserId={currentUserId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-md">
        {staff.map((member) => (
          <div
            key={member.id}
            className="rounded-sm border-hairline border-border-l bg-white shadow-card px-lg py-md flex flex-col gap-xs"
          >
            <div className="flex items-center justify-between gap-md">
              <p className="font-body text-[14px] text-ink">{member.name}</p>
              <StatusPill label={member.active ? 'Active' : 'Inactive'} tone={member.active ? 'ok' : 'muted'} />
            </div>
            <p className="font-body text-[12px] text-muted">{member.email}</p>
            <p className="font-body text-[12px] text-muted capitalize">{member.role}</p>
            <StaffAction staff={member} currentUserId={currentUserId} />
          </div>
        ))}
      </div>
    </>
  );
}
