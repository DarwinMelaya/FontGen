type AppCardProps = {
  label?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

const AppCard = ({
  label,
  description,
  actions,
  children,
  className = "",
}: AppCardProps) => (
  <section
    className={`rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6 ${className}`}
  >
    {(label || actions) && (
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {label && (
            <h2 className="text-sm font-semibold tracking-tight text-primary">
              {label}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </section>
);

export default AppCard;
