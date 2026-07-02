type Props = {
  number: string;
  label: string;
  instruction: string;
};

export function MeasurementCard({ number, label, instruction }: Props) {
  return (
    <div className="bg-light border-hairline border-border-l p-lg flex flex-col gap-sm">
      <p className="font-display font-light text-display-xs text-accent">{number}</p>
      <p className="font-body text-[11px] uppercase tracking-[0.1em] text-ink">{label}</p>
      <p className="font-body text-[11px] font-light text-muted leading-[1.7]">{instruction}</p>
    </div>
  );
}
