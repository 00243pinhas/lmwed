// Shared between app/dashboard/login/actions.ts (immediate check right
// after sign-in) and app/dashboard/login/page.tsx (the ?message=account-inactive
// fallback middleware redirects to for a mid-session deactivation) so both
// paths show identical copy. Kept out of actions.ts because that file has a
// module-level 'use server' directive — every export from it must be an
// async function, so a plain string constant can't live there.
export const ACCOUNT_INACTIVE_MESSAGE = 'This account is no longer active. Please contact Linda.';
