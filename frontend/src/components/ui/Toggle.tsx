type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Toggle = ({ label, checked, onChange }: ToggleProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative flex h-9 w-[4.75rem] items-center rounded-full border transition-colors ${
          checked
            ? "border-border-strong bg-accent-soft"
            : "border-border bg-input"
        }`}
      >
        <span
          className={`absolute top-1 h-7 w-7 rounded-full bg-[var(--toggle-knob)] shadow-md transition-all duration-200 ${
            checked ? "left-[calc(100%-2rem)]" : "left-1 opacity-70"
          }`}
        />
        <span
          className={`w-full text-center text-[10px] font-semibold uppercase tracking-widest text-faint ${
            checked ? "pr-7" : "pl-7"
          }`}
        >
          {checked ? "on" : "off"}
        </span>
      </button>
    </div>
  );
};

export default Toggle;
