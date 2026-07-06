'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { FormField } from '@/components/forms/FormField';
import { login } from './actions';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const searchParams = useSearchParams();
  const deactivated = searchParams.get('message') === 'account-inactive';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    // On success `login` redirects server-side and this line never runs.
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light px-lg">
      <div className="w-full max-w-[360px]">
        <p className="font-display text-[28px] font-light text-ink text-center">LM Weddyli</p>
        <p className="font-body text-[10px] uppercase tracking-[0.16em] text-accent text-center mt-xs">
          Dashboard
        </p>

        <form onSubmit={handleSubmit} className="mt-3xl flex flex-col gap-lg">
          <FormField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />

          {(error || deactivated) && (
            <p className="font-body text-[10px] text-[#B91C1C]">
              {error ?? 'This account has been deactivated.'}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-md min-h-[52px] md:min-h-[48px] w-full bg-dark text-white font-body text-[12px] uppercase tracking-[0.14em] transition-colors duration-ui ease-standard disabled:opacity-50"
          >
            {pending ? 'Signing In…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DashboardLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
