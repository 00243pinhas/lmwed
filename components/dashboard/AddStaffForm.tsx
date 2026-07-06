'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const FIELD_CLASS =
  'min-h-[44px] font-body text-[14px] text-ink border-hairline border-border-l rounded-sm px-md bg-white';
const LABEL_CLASS = 'font-body text-[11px] uppercase tracking-[0.06em] text-muted';

export function AddStaffForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim() || !email.trim() || password.length < 8) {
      setError('Enter a name, email, and a temporary password of at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const result = await res.json();

      if (!result.ok) {
        setError(result.error ?? 'Could not create staff account');
        return;
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setPassword('');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-[420px] flex flex-col gap-lg rounded-sm border-hairline border-border-l bg-white shadow-card px-lg py-lg"
    >
      <div className="flex flex-col gap-xs">
        <label htmlFor="staffName" className={LABEL_CLASS}>
          Name
        </label>
        <input
          id="staffName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>

      <div className="flex flex-col gap-xs">
        <label htmlFor="staffEmail" className={LABEL_CLASS}>
          Email
        </label>
        <input
          id="staffEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          className={FIELD_CLASS}
        />
      </div>

      <div className="flex flex-col gap-xs">
        <label htmlFor="staffPassword" className={LABEL_CLASS}>
          Temporary Password
        </label>
        <input
          id="staffPassword"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
          className={FIELD_CLASS}
        />
        <p className="font-body text-[11px] text-muted">
          Share this with them via WhatsApp — they&apos;ll be asked to change it on first login.
        </p>
      </div>

      {error && (
        <p className="font-body text-[13px] text-alert bg-alert-bg rounded-sm px-md py-sm">{error}</p>
      )}
      {success && (
        <p className="font-body text-[13px] text-ok bg-ok-bg rounded-sm px-md py-sm">
          Staff account created.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="min-h-[44px] bg-dark text-white rounded-sm font-body text-[12px] uppercase tracking-[0.08em] disabled:opacity-50"
      >
        {submitting ? 'Adding…' : 'Add Staff'}
      </button>
    </form>
  );
}
