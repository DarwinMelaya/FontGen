import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, type Transition } from "framer-motion";
import AppLogo from "../../components/ui/AppLogo";
import ThemeToggle from "../../components/ui/ThemeToggle";
import {
  FONT_STYLE_LABELS,
  FANCY_FONT_STYLES,
  toFancyText,
  type FancyFontStyle,
} from "../../utils/fancyText";

const smoothEase = [0.22, 1, 0.36, 1] as Transition["ease"];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: smoothEase },
});

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, delay, ease: smoothEase },
});

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Try it", href: "#try" },
  { label: "How it works", href: "#how" },
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

const FEATURES = [
  {
    title: "Unicode bold in one keystroke",
    body: "Select a phrase and press Ctrl+B. Press it again to switch back to plain text.",
  },
  {
    title: "Hashtag presets",
    body: "Add DOST MIMAROPA tags with one tap. They always go below the post, where they belong.",
  },
  {
    title: "Facebook-ready preview",
    body: "See the post the way readers will, with a live meter for Facebook's character limit.",
  },
  {
    title: "Drafts that stay put",
    body: "Your work saves in the browser automatically, with undo, redo, and find & replace.",
  },
];

const STEPS = [
  { title: "Paste", body: "Drop in your pubmat copy, or start from a sample." },
  { title: "Bold", body: "Highlight headlines and names, then choose a font style." },
  { title: "Copy", body: "Copy the finished post with hashtags and paste it into Facebook." },
];

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

const HeroVisual = () => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.8, delay: 0.2, ease: smoothEase }}
    className="relative mx-auto w-full max-w-md"
    aria-hidden="true"
  >
    <div className="absolute -inset-10 -z-10 rounded-full bg-brand-soft blur-3xl" />

    <div className="rounded-2xl border border-border bg-card p-5 shadow-float">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-input">
          <AppLogo className="h-6 w-auto" alt="" />
        </span>
        <div>
          <p className="text-sm font-semibold text-primary">DOST MIMAROPA</p>
          <p className="text-xs text-faint">Just now · Public</p>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-primary">
        <p className="text-lg leading-snug">
          {toFancyText("Sustainability Takes Center Stage at MIMAROPA RSTW", "bold-serif")}
        </p>
        <p className="text-muted">
          The second day of the 2026 Regional Science, Technology, and Innovation Week continued in Marinduque.
        </p>
        <p>{toFancyText("REGIONAL SCIENTIFIC CONFERENCE", "bold-sans-italic")}</p>
        <p className="text-brand">#2026MIMAROPARSTW #DOSTMIMAROPA</p>
      </div>
    </div>

    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-4 right-6 hidden rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-primary shadow-float sm:block"
    >
      {FONT_STYLE_LABELS["bold-serif"].label}
    </motion.div>

    <motion.div
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      className="absolute -bottom-4 left-6 hidden items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 font-mono text-xs text-accent-text shadow-float sm:flex"
    >
      Ctrl + B
    </motion.div>
  </motion.div>
);

const TryItDemo = () => {
  const [input, setInput] = useState("Science for the people");
  const [copiedStyle, setCopiedStyle] = useState<FancyFontStyle | null>(null);
  const copiedTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(copiedTimerRef.current), []);

  const handleCopy = async (style: FancyFontStyle) => {
    const value = toFancyText(input, style);
    if (!value.trim()) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopiedStyle(style);
      window.clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = window.setTimeout(() => setCopiedStyle(null), 1600);
    } catch {
      setCopiedStyle(null);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
      <label htmlFor="try-input" className="text-sm font-medium text-primary">
        Type anything
      </label>
      <input
        id="try-input"
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="e.g. Regional Science Week"
        className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 text-base text-primary outline-none transition placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand-soft"
      />

      <ul className="mt-5 divide-y divide-border">
        {FANCY_FONT_STYLES.map((style) => {
          const { label, hint } = FONT_STYLE_LABELS[style];
          const output = toFancyText(input, style);
          const isCopied = copiedStyle === style;

          return (
            <li key={style} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-faint">
                  <span className="font-medium text-muted">{label}</span> · {hint}
                </p>
                <p className="mt-1 truncate text-xl leading-snug text-primary">
                  {output || <span className="text-faint">…</span>}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleCopy(style)}
                disabled={!input.trim()}
                aria-label={`Copy ${label} text`}
                className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition active:scale-[0.97] disabled:opacity-40 ${
                  isCopied
                    ? "border-transparent bg-brand-soft text-brand"
                    : "border-border bg-card text-primary hover:border-border-strong hover:bg-accent-soft"
                }`}
              >
                {isCopied ? "Copied" : "Copy"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-page text-primary">
      <motion.header
        {...fadeUp(0)}
        className="sticky top-0 z-30 border-b border-border bg-page/80 backdrop-blur-lg"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 rounded-lg" aria-label="FontGen home">
            <AppLogo className="h-8 w-auto" alt="" />
            <span className="text-sm font-semibold tracking-tight text-primary">FontGen</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-accent-soft hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/main"
              className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-text transition hover:bg-accent-hover active:scale-[0.98]"
            >
              Open editor
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid items-center gap-16 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:pb-28 lg:pt-24">
          <div>
            <motion.p
              {...fadeUp(0.05)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
              Built for DOST MIMAROPA pubmat teams
            </motion.p>

            <motion.h1
              {...fadeUp(0.1)}
              className="mt-6 max-w-xl font-display text-6xl leading-[0.95] tracking-tight text-primary sm:text-7xl lg:text-[5.5rem]"
            >
              Pubmat captions, <em className="text-brand">bolded</em> for Facebook.
            </motion.h1>

            <motion.p
              {...fadeUp(0.18)}
              className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
            >
              Format Facebook posts without messy copy-paste. Apply Unicode
              bold, add hashtags, and copy a ready-to-post caption in seconds.
            </motion.p>

            <motion.div {...fadeUp(0.26)} className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/main"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-text transition hover:bg-accent-hover active:scale-[0.98]"
              >
                Start formatting
                <ArrowIcon />
              </Link>
              <a
                href="#try"
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-primary transition hover:border-border-strong hover:bg-accent-soft"
              >
                Try it here
              </a>
            </motion.div>

            <motion.p {...fadeUp(0.32)} className="mt-6 text-sm text-faint">
              Free · No sign-up · Works on mobile
            </motion.p>
          </div>

          <HeroVisual />
        </section>

        <motion.section {...inView()} aria-labelledby="trust-heading" className="border-t border-border py-12">
          <h2 id="trust-heading" className="text-center text-sm text-muted">
            Used by teams across DOST MIMAROPA
          </h2>
          <ul className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUST_LOGOS.map((name) => (
              <li
                key={name}
                className="text-sm font-semibold uppercase tracking-[0.12em] text-faint transition hover:text-primary"
              >
                {name}
              </li>
            ))}
          </ul>
        </motion.section>

        <section
          id="features"
          className="grid scroll-mt-20 gap-12 border-t border-border py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-28"
        >
          <motion.div {...inView()} className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand">Features</p>
            <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-primary sm:text-5xl">
              Everything a pubmat needs. <span className="text-faint">Nothing it doesn't.</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
              One focused editor for writing, emphasising, and shipping Facebook
              captions. No accounts or installs.
            </p>
          </motion.div>

          <ol className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {FEATURES.map((feature, index) => (
              <motion.li
                key={feature.title}
                {...inView(index * 0.06)}
                className="bg-card p-6 sm:p-7"
              >
                <span className="font-mono text-xs text-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        <section
          id="try"
          className="grid scroll-mt-20 items-start gap-12 border-t border-border py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-28"
        >
          <motion.div {...inView()}>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand">Try it</p>
            <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-primary sm:text-5xl">
              Three bold styles, <span className="text-faint">ready to paste.</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
              These are Unicode characters, not formatting, so they stay bold
              anywhere plain text works: Facebook, Messenger, and comments.
            </p>
          </motion.div>

          <motion.div {...inView(0.08)}>
            <TryItDemo />
          </motion.div>
        </section>

        <section id="how" className="scroll-mt-20 border-t border-border py-20 lg:py-28">
          <motion.div {...inView()} className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand">How it works</p>
            <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-primary sm:text-5xl">
              Paste. Bold. Copy.
            </h2>
          </motion.div>

          <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step, index) => (
              <motion.li key={step.title} {...inView(index * 0.08)} className="border-t border-border-strong pt-5">
                <span className="font-display text-5xl leading-none text-faint">{index + 1}</span>
                <h3 className="mt-4 text-base font-semibold text-primary">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        <motion.section
          {...inView()}
          className="relative mb-20 overflow-hidden rounded-3xl bg-accent px-6 py-16 text-center text-accent-text sm:px-12 sm:py-20"
        >
          <h2 className="mx-auto max-w-2xl font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            Format your next pubmat <em>this afternoon.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed opacity-70">
            Paste your copy, bold the key lines, add hashtags, and post in minutes.
          </p>
          <Link
            to="/main"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-page px-6 py-3 text-sm font-semibold text-primary transition hover:opacity-90 active:scale-[0.98]"
          >
            Open the editor
            <ArrowIcon />
          </Link>
        </motion.section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <AppLogo className="h-6 w-auto" alt="" />
            <span>DOST MIMAROPA · Pubmat Font Generator</span>
          </div>
          <p className="text-faint">Developed by Darwin D. Melaya</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
