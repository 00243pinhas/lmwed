export type PillTone = 'ok' | 'neutral' | 'muted' | 'warn' | 'alert';

const TONE_CLASSES: Record<PillTone, string> = {
  ok: 'bg-ok-bg text-ok',
  neutral: 'bg-white text-ink border-hairline border-border-l',
  muted: 'bg-light text-muted border-hairline border-border-l',
  warn: 'bg-warn-bg text-warn',
  alert: 'bg-alert-bg text-alert',
};

export function StatusPill({ label, tone }: { label: string; tone: PillTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-sm py-xs font-body text-[11px] uppercase tracking-[0.06em] ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}
