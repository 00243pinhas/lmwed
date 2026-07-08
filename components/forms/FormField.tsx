type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'tel' | 'email' | 'url' | 'password';
  name?: string;
  placeholder?: string;
  optional?: boolean;
  // Shared with the (English-only, non-localized) dashboard — callers on the
  // public site pass a translated string; dashboard callers rely on this
  // English default.
  optionalLabel?: string;
  note?: string;
  error?: string;
  autoComplete?: string;
};

export function FormField({
  label,
  value,
  onChange,
  type = 'text',
  name,
  placeholder,
  optional,
  optionalLabel = '(Optional)',
  note,
  error,
  autoComplete,
}: Props) {
  return (
    <div>
      <label className="font-body text-[9px] uppercase tracking-[0.14em] text-muted block">
        {label}
        {optional && <span className="normal-case tracking-normal"> {optionalLabel}</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-sm block w-full min-h-[48px] border-0 border-b-hairline bg-transparent font-display text-[18px] text-ink outline-none transition-colors duration-200 ease-standard placeholder:text-accent ${
          error ? 'border-b-[1px] border-[#B91C1C]' : 'border-border-l focus:border-ink'
        }`}
      />
      {error ? (
        <p className="font-body text-[10px] text-[#B91C1C] mt-xs">{error}</p>
      ) : (
        note && <p className="font-body text-[10px] text-accent mt-xs">{note}</p>
      )}
    </div>
  );
}
