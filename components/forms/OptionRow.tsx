type Props = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function OptionRow({ label, options, value, onChange, error }: Props) {
  const wrap = options.length >= 4;

  return (
    <div>
      <p className="font-body text-[9px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <div
        className={`mt-sm gap-x-lg gap-y-md ${
          wrap ? 'grid grid-cols-2 sm:flex sm:flex-wrap' : 'flex flex-wrap'
        }`}
      >
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={`min-h-11 w-fit text-left font-body text-[11px] uppercase tracking-[0.1em] pb-xs border-b transition-colors duration-200 ease-standard ${
                selected
                  ? 'text-ink border-ink border-b-[1px]'
                  : 'text-muted border-border-l border-b-hairline hover:text-ink'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {error && <p className="font-body text-[10px] text-[#B91C1C] mt-xs">{error}</p>}
    </div>
  );
}
