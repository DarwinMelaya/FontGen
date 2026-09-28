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
  const logo = (
    <span className="flex items-center gap-2.5">
      <AppLogo className="h-8 w-auto" alt="" />
      <span className="text-sm font-semibold tracking-tight text-primary">
        FontGen
      </span>
    </span>
  );

  return (
    <header className="mb-8 flex flex-col gap-8 sm:mb-10">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          {showHomeLink ? (
            <Link
              to="/"
              aria-label="FontGen home"
              className="rounded-lg transition hover:opacity-75"
            >
              {logo}
            </Link>
          ) : (
            logo
          )}
          {title && (
            <>
              <span className="text-faint" aria-hidden="true">/</span>
              <span className="font-medium text-muted" aria-current="page">
                {title}
              </span>
            </>
          )}
        </nav>
        <ThemeToggle />
      </div>

      {(title || description) && (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand">
              {eyebrow}
            </p>
            {title && (
              <h1 className="mt-2 font-display text-4xl leading-none tracking-tight text-primary sm:text-5xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
                {description}
              </p>
            )}
          </div>
          {children}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
