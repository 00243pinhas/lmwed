type Props = {
  label: string;
  light?: boolean;
};

export function SectionMarker({ label, light = false }: Props) {
  return (
    <p
      className={`font-body text-[10px] uppercase tracking-[0.16em] ${
        light ? 'text-accent' : 'text-accent'
      }`}
    >
      {label}
    </p>
  );
}
