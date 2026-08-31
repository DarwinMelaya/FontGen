import { Link } from "react-router-dom";
import AppLogo from "../ui/AppLogo";
import ThemeToggle from "../ui/ThemeToggle";

type PageHeaderProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  showHomeLink?: boolean;
  children?: React.ReactNode;
};

const PageHeader = ({
  eyebrow = "DOST MIMAROPA · Pubmat Tool",
  title,
  description,
  showHomeLink = false,
  children,
}: PageHeaderProps) => {
  return (
    <header className="mb-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {showHomeLink ? (
            <Link to="/" className="transition hover:opacity-80">
              <AppLogo className="h-14 w-auto" />
            </Link>
          ) : (
            <AppLogo className="h-14 w-auto" />
          )}
          <ThemeToggle />
        </div>
      </div>

      {(title || description) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
              {eyebrow}
            </p>
            {title && (
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 max-w-xl text-sm text-muted">{description}</p>
            )}
          </div>
          {children}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
