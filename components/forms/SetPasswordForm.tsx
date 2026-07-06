'use client';

import { useState } from 'react';

import { FormField } from '@/components/forms/FormField';
import { setPassword } from '@/app/dashboard/set-password/actions';

export function SetPasswordForm() {
  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await setPassword(formData);

    // On success `setPassword` redirects server-side and this line never runs.
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3xl flex flex-col gap-lg">
      <FormField
        label="New Password"
        name="password"
        type="password"
        value={password}
        onChange={setPasswordValue}
        autoComplete="new-password"
        note="At least 8 characters."
      />
      <FormField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
      />

      {error && <p className="font-body text-[10px] text-[#B91C1C]">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-md min-h-[52px] md:min-h-[48px] w-full bg-dark text-white font-body text-[12px] uppercase tracking-[0.14em] transition-colors duration-ui ease-standard disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Set Password & Continue'}
      </button>
    </form>
  );
}
