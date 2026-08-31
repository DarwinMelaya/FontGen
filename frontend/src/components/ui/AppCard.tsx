type AppCardProps = {
  label?: string;
  children: React.ReactNode;
  className?: string;
};

const AppCard = ({ label, children, className = "" }: AppCardProps) => (
  <section
    className={`rounded-2xl border border-border bg-card p-5 shadow-card ${className}`}
  >
    {label && (
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
        {label}
      </p>
    )}
    {children}
  </section>
);

export default AppCard;
