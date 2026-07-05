export function StatCard({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: 'neutral' | 'alert';
}) {
  return (
    <div
      className={`rounded-sm border-hairline shadow-card px-lg py-md flex flex-col gap-xs ${
        tone === 'alert' ? 'bg-alert-bg border-alert' : 'bg-white border-border-l'
      }`}
    >
      <p
        className={`font-body text-[28px] font-medium tabular-nums ${
          tone === 'alert' ? 'text-alert' : 'text-ink'
        }`}
      >
        {value}
      </p>
      <p
        className={`font-body text-[11px] uppercase tracking-[0.06em] ${
          tone === 'alert' ? 'text-alert' : 'text-muted'
        }`}
      >
        {label}
      </p>
      {detail && <p className="font-body text-[12px] text-muted">{detail}</p>}
    </div>
  );
}
