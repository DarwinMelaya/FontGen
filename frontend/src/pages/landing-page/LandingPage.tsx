import { Link } from "react-router-dom";
import { motion, type Transition } from "framer-motion";
import AppLogo from "../../components/ui/AppLogo";
import ThemeToggle from "../../components/ui/ThemeToggle";
import { FONT_STYLE_LABELS, FANCY_FONT_STYLES } from "../../utils/fancyText";

const smoothEase = [0.22, 1, 0.36, 1] as Transition["ease"];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: smoothEase },
});

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Fonts", href: "#fonts" },
  { label: "Help", href: "#help" },
  { label: "Editor", to: "/main" },
];

const TRUST_LOGOS = [
  "DOST MIMAROPA",
  "Marinduque",
  "RSTW",
  "MarSU",
  "MSME",
  "LGU Torrijos",
  "Academe",
  "Innovators",
  "Researchers",
  "Communities",
  "DOST PSTC",
  "Science Week",
];

const HeroVisual = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92, rotate: -6 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{ duration: 0.8, delay: 0.25, ease: smoothEase }}
    className="relative flex items-center justify-center"
  >
    <motion.div
      animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      <div className="absolute -inset-8 rounded-full bg-zinc-200/50 blur-3xl dark:bg-zinc-800/40" />
      <div className="relative grid grid-cols-2 gap-3 p-2">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.04, rotate: index % 2 === 0 ? 3 : -3 }}
            className="flex h-24 w-24 items-center justify-center rounded-2xl border border-zinc-300 bg-gradient-to-br from-zinc-100 to-zinc-300 shadow-2xl dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-950 sm:h-28 sm:w-28"
            style={{ transform: `rotate(${index * 4 - 6}deg)` }}
          >
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {index === 0 ? "𝐀" : index === 1 ? "𝗔" : index === 2 ? "𝙰" : "a"}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
        <AppLogo className="h-20 w-auto opacity-90" />
      </div>
    </motion.div>
  </motion.div>
);

const LandingPage = () => {
  return (
    <div className="font-landing min-h-screen bg-page text-primary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.header
          {...fadeUp(0)}
          className="flex items-center justify-between py-6"
        >
          <Link to="/" className="flex items-center gap-3">
            <AppLogo className="h-9 w-auto" />
            <span className="text-base font-semibold tracking-tight text-primary">
              FontGen
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm font-medium text-muted transition hover:text-primary"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted transition hover:text-primary"
                >
                  {link.label}
                </a>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              to="/main"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-primary transition hover:bg-input"
            >
              Get Started
            </Link>
          </div>
        </motion.header>

        <section className="grid items-center gap-12 pb-24 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pt-16">
          <div>
            <motion.h1
              {...fadeUp(0.08)}
              className="max-w-xl text-5xl font-bold leading-[1.05] tracking-tight text-primary sm:text-6xl lg:text-7xl"
            >
              Fonts for pubmat teams
            </motion.h1>

            <motion.p
              {...fadeUp(0.16)}
              className="mt-6 max-w-lg text-base font-medium leading-relaxed text-muted sm:text-lg"
            >
              The best way to format Facebook pubmat without messy copy-paste.
              Apply Unicode bold, add hashtags, and copy ready posts at scale.
            </motion.p>

            <motion.div
              {...fadeUp(0.24)}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/main"
                className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-text transition hover:bg-accent-hover"
              >
                Get Started
              </Link>
              <Link
                to="/main"
                className="text-sm font-medium text-muted transition hover:text-primary"
              >
                Open Editor
              </Link>
            </motion.div>
          </div>

          <HeroVisual />
        </section>

        <motion.section
          {...fadeUp(0.32)}
          className="border-t border-border py-16"
        >
          <p className="text-center text-sm font-medium text-muted">
            Teams across DOST MIMAROPA trust Pubmat for publication materials
          </p>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.04, delayChildren: 0.4 },
              },
            }}
            className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6"
          >
            {TRUST_LOGOS.map((name) => (
              <motion.div
                key={name}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 },
                }}
                className="flex items-center justify-center text-center text-sm font-semibold tracking-wide text-faint transition hover:text-muted"
              >
                {name}
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          id="features"
          {...fadeUp(0.12)}
          className="border-t border-border py-24"
        >
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card">
              <AppLogo className="h-10 w-auto" />
            </div>

            <h2 className="mt-8 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              Format <span className="text-faint">this afternoon</span>
            </h2>

            <p className="mt-4 text-base font-medium leading-relaxed text-muted">
              Paste your pubmat, bold the important lines, drop in hashtags, and
              copy the final post for Facebook in minutes.
            </p>

            <Link
              to="/main"
              className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-text transition hover:bg-accent-hover"
            >
              Start formatting
            </Link>
          </div>
        </motion.section>

        <motion.section
          id="fonts"
          {...fadeUp(0.08)}
          className="border-t border-border pb-24 pt-16"
        >
          <p className="mb-8 text-center text-sm font-semibold uppercase tracking-[0.2em] text-faint">
            Unicode font styles
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {FANCY_FONT_STYLES.map((style, index) => {
              const { label, sample, hint } = FONT_STYLE_LABELS[style];

              return (
                <motion.div
                  key={style}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: index * 0.08, duration: 0.45 }}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <p className="text-sm font-semibold text-primary">{label}</p>
                  <p className="mt-3 text-3xl text-primary">{sample}</p>
                  <p className="mt-2 text-sm font-medium text-muted">{hint}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <footer
          id="help"
          className="border-t border-border py-8 text-center text-sm font-medium text-muted"
        >
          <p>DOST MIMAROPA · Pubmat Font Generator</p>
          <p className="mt-2">Developed by: Darwin D. Melaya</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
