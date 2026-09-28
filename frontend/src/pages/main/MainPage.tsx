import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, type Transition } from "framer-motion";
import PageHeader from "../../components/layout/PageHeader";
import AppCard from "../../components/ui/AppCard";
import AppLogo from "../../components/ui/AppLogo";
import Toast from "../../components/ui/Toast";
import Toggle from "../../components/ui/Toggle";
import {
  FANCY_FONT_STYLES,
  FONT_STYLE_LABELS,
  fromFancyText,
  hasFancyChars,
  toggleFancyText,
  toFancyText,
  type FancyFontStyle,
} from "../../utils/fancyText";

const HASHTAG_PRESETS = [
  "#2026MIMAROPARSTW",
  "#DOSTMIMAROPA",
  "#DOSTMarinduque",
  "#SUSTAINMIMAROPA",
  "#AghamNaRamdam",
  "#OneDOST4U",
  "#SolutionsAndOpportunitiesForAll",
];

const SAMPLE_TEXT = `Sustainability Takes Center Stage as MIMAROPA RSTW Continues in Marinduque

The second and final day of the 2026 MIMAROPA Regional Science, Technology, and Innovation Week (RSTW) in Marinduque continued the celebration with conversations centered on environmental sustainability, research, and collective action for a resilient future.

REGIONAL SCIENTIFIC CONFERENCE
The morning began with the Regional Scientific Conference moderated by Ms. Giselle M. Perlas from Marinduque State University.`;

const DRAFT_STORAGE_KEY = "pubmat-draft";
const FACEBOOK_CHAR_LIMIT = 63206;

const toolbarButtonClass =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted transition hover:bg-accent-soft hover:text-primary active:scale-[0.97] disabled:pointer-events-none disabled:opacity-35 sm:h-8";

const toolbarDivider = (
  <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" />
);

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-text transition hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-primary transition hover:border-border-strong hover:bg-accent-soft active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40";

const textInputClass =
  "w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-base text-primary outline-none transition placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand-soft sm:text-sm";

const mobileBoldButtonClass =
  "rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold text-primary transition active:scale-[0.98] disabled:opacity-35";

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-input px-1.5 font-mono text-[11px] font-medium text-muted">
    {children}
  </kbd>
);

const preventSelectionLoss = (event: React.MouseEvent | React.PointerEvent) => {
  event.preventDefault();
};

const smoothEase = [0.22, 1, 0.36, 1] as Transition["ease"];

const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.35 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.12 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: smoothEase },
  },
};

const MainPage = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedSelectionRef = useRef({ start: 0, end: 0 });
  const selectionUiTimerRef = useRef<number | undefined>(undefined);
  const toastTimerRef = useRef<number | undefined>(undefined);
  const [text, setText] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [activeStyle, setActiveStyle] = useState<FancyFontStyle>("bold-sans");
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [findQuery, setFindQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [autoCopy, setAutoCopy] = useState(false);
  const [includeHashtagsOnCopy, setIncludeHashtagsOnCopy] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [selectionLength, setSelectionLength] = useState(0);

  const captureSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    savedSelectionRef.current = { start, end };

    window.clearTimeout(selectionUiTimerRef.current);
    selectionUiTimerRef.current = window.setTimeout(() => {
      setSelectionLength(Math.max(0, end - start));
    }, 250);
  }, []);

  const getSelectionRange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return savedSelectionRef.current;

    const liveStart = textarea.selectionStart;
    const liveEnd = textarea.selectionEnd;

    if (liveStart !== liveEnd) {
      savedSelectionRef.current = { start: liveStart, end: liveEnd };
      return savedSelectionRef.current;
    }

    return savedSelectionRef.current;
  };

  const showToast = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2400);
  };

  const pushHistory = useCallback(() => {
    setHistory((stack) => [...stack.slice(-19), text]);
    setRedoStack([]);
  }, [text]);

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!savedDraft) return;

    try {
      const draft = JSON.parse(savedDraft) as { text?: string; hashtags?: string };
      if (draft.text) setText(draft.text);
      if (draft.hashtags) setHashtags(draft.hashtags);
    } catch {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ text, hashtags }),
      );
    }, 400);

    return () => window.clearTimeout(timer);
  }, [text, hashtags]);

  const getFullOutput = useCallback(() => {
    const trimmedHashtags = hashtags.trim();
    if (!includeHashtagsOnCopy || !trimmedHashtags) return text;
    return `${text}\n\n${trimmedHashtags}`;
  }, [text, hashtags, includeHashtagsOnCopy]);

  const applyStyleAndMaybeCopy = async (style: FancyFontStyle) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end } = getSelectionRange();
    if (start === end) {
      showToast("Select text first");
      return;
    }

    const selected = text.slice(start, end);
    const removingBold = hasFancyChars(selected);
    const converted = toggleFancyText(selected, style);
    const next = text.slice(0, start) + converted + text.slice(end);

    pushHistory();
    setText(next);

    if (autoCopy) {
      const trimmedHashtags = hashtags.trim();
      const output =
        includeHashtagsOnCopy && trimmedHashtags
          ? `${next}\n\n${trimmedHashtags}`
          : next;
      await navigator.clipboard.writeText(output);
      showToast(
        removingBold ? "Bold removed & copied" : "Bold applied & copied",
      );
    } else {
      showToast(
        removingBold
          ? "Bold removed"
          : `Bold applied · ${FONT_STYLE_LABELS[style].label}`,
      );
    }

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + converted.length);
    });
  };

  const convertAllText = (style: FancyFontStyle) => {
    if (!text.trim()) {
      showToast("Add text first");
      return;
    }
    pushHistory();
    setText(toFancyText(text, style));
    showToast(`All text converted to ${FONT_STYLE_LABELS[style].label}`);
  };

  const convertCurrentLine = (style: FancyFontStyle) => {
    const textarea = textareaRef.current;
    if (!textarea || !text) return;

    const { start: cursor } = getSelectionRange();
    const lineStart = text.lastIndexOf("\n", cursor - 1) + 1;
    const lineEndIndex = text.indexOf("\n", cursor);
    const lineEnd = lineEndIndex === -1 ? text.length : lineEndIndex;
    const line = text.slice(lineStart, lineEnd);
    const converted = toFancyText(line, style);
    const next = text.slice(0, lineStart) + converted + text.slice(lineEnd);

    pushHistory();
    setText(next);
    showToast("Current line converted");
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    setRedoStack((stack) => [...stack, text]);
    const previous = history[history.length - 1];
    setHistory((stack) => stack.slice(0, -1));
    setText(previous);
    showToast("Undo");
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    setHistory((stack) => [...stack, text]);
    const next = redoStack[redoStack.length - 1];
    setRedoStack((stack) => stack.slice(0, -1));
    setText(next);
    showToast("Redo");
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText.trim()) {
        showToast("Clipboard is empty");
        return;
      }

      pushHistory();
      setText((prev) => (prev.trim() ? `${prev}\n\n${clipboardText}` : clipboardText));
      showToast("Pasted from clipboard");
    } catch {
      showToast("Clipboard access denied");
    }
  };

  const handleRemoveAllBold = () => {
    if (!text.trim()) return;

    pushHistory();
    setText(fromFancyText(text));
    showToast("All bold removed");
  };

  const handleNormalizeLines = () => {
    if (!text.trim()) return;

    pushHistory();
    setText(text.replace(/\n{3,}/g, "\n\n").trim());
    showToast("Extra blank lines removed");
  };

  const handleClearHashtags = () => {
    if (!hashtags.trim()) return;
    setHashtags("");
    showToast("Hashtags cleared");
  };

  const handleDownload = () => {
    const output = getFullOutput();
    if (!output.trim()) {
      showToast("Nothing to download");
      return;
    }

    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pubmat.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded pubmat.txt");
  };

  const findNextMatch = () => {
    if (!findQuery.trim()) {
      showToast("Enter text to find");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const query = findQuery.toLowerCase();
    const source = text.toLowerCase();
    const start = textarea.selectionEnd;
    let index = source.indexOf(query, start);

    if (index === -1) index = source.indexOf(query);

    if (index === -1) {
      showToast("No matches found");
      return;
    }

    textarea.focus();
    textarea.setSelectionRange(index, index + findQuery.length);
  };

  const replaceNextMatch = () => {
    if (!findQuery.trim()) {
      showToast("Enter text to find");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = text.slice(start, end);

    if (selected.toLowerCase() !== findQuery.toLowerCase()) {
      findNextMatch();
      return;
    }

    pushHistory();
    const next = text.slice(0, start) + replaceQuery + text.slice(end);
    setText(next);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replaceQuery.length);
    });

    showToast("Replaced");
  };

  const replaceAllMatches = () => {
    if (!findQuery.trim()) {
      showToast("Enter text to find");
      return;
    }

    const pattern = findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(pattern, "gi");
    if (!regex.test(text)) {
      showToast("No matches found");
      return;
    }

    pushHistory();
    setText(text.replace(regex, replaceQuery));
    showToast("Replaced all matches");
  };

  const handleClear = () => {
    if (!text && !hashtags) return;
    pushHistory();
    setText("");
    setHashtags("");
    showToast("Cleared");
  };

  const handleLoadSample = () => {
    pushHistory();
    setText(SAMPLE_TEXT);
    setHashtags(HASHTAG_PRESETS.join(" "));
    showToast("Sample loaded");
  };

  const addHashtag = (tag: string) => {
    setHashtags((prev) => {
      if (prev.includes(tag)) return prev;
      return prev.trim() ? `${prev.trim()} ${tag}` : tag;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.ctrlKey && event.key.toLowerCase() === "b") {
      event.preventDefault();
      void applyStyleAndMaybeCopy(activeStyle);
    }
    if (event.ctrlKey && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    }
    if (event.ctrlKey && event.key.toLowerCase() === "y") {
      event.preventDefault();
      handleRedo();
    }
  };

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const fullOutput = getFullOutput();
    const hashtagCount = hashtags.trim()
      ? hashtags.trim().split(/\s+/).filter((tag) => tag.startsWith("#")).length
      : 0;

    return {
      chars: text.length,
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      lines: text ? text.split("\n").length : 0,
      hashtagCount,
      fbChars: fullOutput.length,
      fbRemaining: FACEBOOK_CHAR_LIMIT - fullOutput.length,
    };
  }, [text, hashtags, includeHashtagsOnCopy, getFullOutput]);

  const copyText = async (value: string, message: string) => {
    if (!value.trim()) {
      showToast("Nothing to copy");
      return;
    }
    await navigator.clipboard.writeText(value);
    showToast(message);
  };

  const handleCopyFull = () => copyText(getFullOutput(), "Copied for Facebook");

  const fullOutput = getFullOutput();
  const hasOutput = fullOutput.trim().length > 0;
  const showHashtagsInPreview = includeHashtagsOnCopy && hashtags.trim().length > 0;
  const fbUsagePercent = Math.min(100, (stats.fbChars / FACEBOOK_CHAR_LIMIT) * 100);
  const fbState =
    stats.fbRemaining < 0 ? "over" : stats.fbRemaining < 500 ? "near" : "ok";
  const selectionHint =
    selectionLength > 0
      ? `${selectionLength} characters selected`
      : "Highlight text in the editor";

  const renderBoldStylePicker = (compact = false) => (
    <div
      role="group"
      aria-label="Font style"
      className={compact ? "flex touch-pan-x gap-2 overflow-x-auto pb-1" : "space-y-2"}
    >
      {FANCY_FONT_STYLES.map((style) => {
        const { label, sample, hint } = FONT_STYLE_LABELS[style];
        const isActive = activeStyle === style;

        if (compact) {
          return (
            <button
              key={style}
              type="button"
              aria-pressed={isActive}
              onMouseDown={preventSelectionLoss}
              onPointerDown={preventSelectionLoss}
              onClick={() => setActiveStyle(style)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${
                isActive
                  ? "border-accent bg-accent text-accent-text"
                  : "border-border bg-card text-primary"
              }`}
            >
              <span className="block text-[11px] font-medium opacity-75">{label}</span>
              <span className="mt-1 block text-lg leading-none">{sample}</span>
            </button>
          );
        }

        return (
          <button
            key={style}
            type="button"
            aria-pressed={isActive}
            onMouseDown={preventSelectionLoss}
            onClick={() => setActiveStyle(style)}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
              isActive
                ? "border-brand bg-brand-soft"
                : "border-border bg-card hover:border-border-strong hover:bg-accent-soft"
            }`}
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-primary">{label}</span>
                <span className="truncate text-xs text-faint">{hint}</span>
              </span>
              <span className="mt-1.5 block text-xl leading-none text-primary">{sample}</span>
            </span>
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
                isActive ? "border-brand bg-brand" : "border-border-strong"
              }`}
              aria-hidden="true"
            >
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-card" />}
            </span>
          </button>
        );
      })}
    </div>
  );

  const settingsToggles = (
    <div className="space-y-4">
      <Toggle
        label="Auto-copy after bold"
        description="Copies the full post every time you apply bold."
        checked={autoCopy}
        onChange={setAutoCopy}
      />
      <Toggle
        label="Include hashtags on copy"
        description="Adds your hashtags below the post."
        checked={includeHashtagsOnCopy}
        onChange={setIncludeHashtagsOnCopy}
      />
    </div>
  );

  return (
    <motion.div
      className="min-h-screen bg-page text-primary"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-6 sm:pt-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: smoothEase }}
        >
          <PageHeader
            showHomeLink
            title="Font Generator"
            description="Paste pubmat copy, bold key phrases with Unicode fonts, add hashtags, and copy straight to Facebook."
          />
        </motion.div>

        <motion.div
          className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <div className="min-w-0 space-y-5">
            <motion.section
              variants={staggerItem}
              aria-label="Text editor"
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand-soft"
            >
              <div
                role="toolbar"
                aria-label="Editor tools"
                className="flex items-center gap-0.5 overflow-x-auto border-b border-border px-2 py-1.5"
              >
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  title="Undo (Ctrl+Z)"
                  className={toolbarButtonClass}
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  title="Redo (Ctrl+Y)"
                  className={toolbarButtonClass}
                >
                  Redo
                </button>
                {toolbarDivider}
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className={toolbarButtonClass}
                >
                  Paste
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className={toolbarButtonClass}
                >
                  Load sample
                </button>
                {toolbarDivider}
                <button
                  type="button"
                  onClick={handleRemoveAllBold}
                  disabled={!text.trim()}
                  className={toolbarButtonClass}
                >
                  Remove all bold
                </button>
                <button
                  type="button"
                  onClick={handleNormalizeLines}
                  disabled={!text.trim()}
                  className={toolbarButtonClass}
                >
                  Trim blank lines
                </button>
                <span className="min-w-2 flex-1" aria-hidden="true" />
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={!text && !hashtags}
                  className={`${toolbarButtonClass} hover:bg-danger-soft hover:text-danger`}
                >
                  Clear all
                </button>
              </div>

              <label htmlFor="pubmat-editor" className="sr-only">
                Pubmat text
              </label>
              <textarea
                id="pubmat-editor"
                ref={textareaRef}
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={handleKeyDown}
                onSelect={captureSelection}
                onKeyUp={captureSelection}
                onMouseUp={captureSelection}
                onFocus={captureSelection}
                placeholder="Paste or type your pubmat text here…"
                rows={14}
                className="block min-h-[260px] w-full resize-y bg-transparent px-5 py-4 text-base leading-relaxed text-primary outline-none placeholder:text-faint select-text touch-manipulation sm:text-[15px] lg:min-h-[400px]"
              />

              <div className="space-y-3 border-t border-border bg-input p-4 lg:hidden">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
                    Bold tools
                  </p>
                  <span className="text-xs text-muted">{selectionHint}</span>
                </div>

                {renderBoldStylePicker(true)}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onMouseDown={preventSelectionLoss}
                    onPointerDown={preventSelectionLoss}
                    onClick={() => convertCurrentLine(activeStyle)}
                    className={mobileBoldButtonClass}
                  >
                    Bold line
                  </button>
                  <button
                    type="button"
                    onMouseDown={preventSelectionLoss}
                    onPointerDown={preventSelectionLoss}
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className={mobileBoldButtonClass}
                  >
                    Undo
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border px-5 py-3 text-xs text-muted">
                <span className="font-mono tabular-nums">
                  {stats.chars.toLocaleString()} chars · {stats.words.toLocaleString()} words ·{" "}
                  {stats.lines.toLocaleString()} lines
                </span>
                <span className="hidden items-center gap-4 lg:flex">
                  <span className="flex items-center gap-1.5">
                    <Kbd>Ctrl</Kbd>
                    <Kbd>B</Kbd>
                    Bold
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Kbd>Ctrl</Kbd>
                    <Kbd>Z</Kbd>
                    Undo
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Kbd>Ctrl</Kbd>
                    <Kbd>Y</Kbd>
                    Redo
                  </span>
                </span>
                <span className="text-faint lg:hidden">Draft auto-saves</span>
              </div>
            </motion.section>

            <motion.div variants={staggerItem}>
              <AppCard
                label="Hashtags"
                description="Tap a preset to add it, or type your own."
                actions={
                  <>
                    <span className="font-mono text-xs tabular-nums text-faint">
                      {stats.hashtagCount} tags
                    </span>
                    <button
                      type="button"
                      onClick={handleClearHashtags}
                      disabled={!hashtags.trim()}
                      className={`${toolbarButtonClass} hover:bg-danger-soft hover:text-danger`}
                    >
                      Clear
                    </button>
                  </>
                }
              >
                <label htmlFor="pubmat-hashtags" className="sr-only">
                  Hashtags
                </label>
                <textarea
                  id="pubmat-hashtags"
                  value={hashtags}
                  onChange={(event) => setHashtags(event.target.value)}
                  placeholder="#2026MIMAROPARSTW #DOSTMIMAROPA"
                  rows={2}
                  className={`${textInputClass} resize-y leading-relaxed`}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {HASHTAG_PRESETS.map((tag) => {
                    const isAdded = hashtags.includes(tag);

                    return (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={isAdded}
                        onClick={() => addHashtag(tag)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-[0.97] ${
                          isAdded
                            ? "border-transparent bg-brand-soft text-brand"
                            : "border-border bg-card text-muted hover:border-border-strong hover:text-primary"
                        }`}
                      >
                        {isAdded ? "✓ " : "+ "}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </AppCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <AppCard label="Preview" description="How your post will read on Facebook.">
                <article className="overflow-hidden rounded-xl border border-border bg-input">
                  <header className="flex items-center gap-3 px-4 pt-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                      <AppLogo className="h-6 w-auto" alt="" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-primary">DOST MIMAROPA</p>
                      <p className="text-xs text-faint">Just now · Public</p>
                    </div>
                  </header>
                  <div className="min-h-32 whitespace-pre-wrap break-words px-4 pb-5 pt-3 text-[15px] leading-relaxed text-primary">
                    {text || (
                      <span className="text-faint">
                        Your formatted post appears here as you type.
                      </span>
                    )}
                    {showHashtagsInPreview && (
                      <p className="mt-4 text-brand">{hashtags.trim()}</p>
                    )}
                  </div>
                </article>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-muted">Facebook character limit</span>
                    <span
                      className={`font-mono tabular-nums ${
                        fbState === "over"
                          ? "text-danger"
                          : fbState === "near"
                            ? "text-warning"
                            : "text-muted"
                      }`}
                    >
                      {stats.fbChars.toLocaleString()} / {FACEBOOK_CHAR_LIMIT.toLocaleString()}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label="Facebook character usage"
                    aria-valuemin={0}
                    aria-valuemax={FACEBOOK_CHAR_LIMIT}
                    aria-valuenow={Math.min(stats.fbChars, FACEBOOK_CHAR_LIMIT)}
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"
                  >
                    <div
                      className={`h-full rounded-full transition-[width] duration-300 ${
                        fbState === "over"
                          ? "bg-danger"
                          : fbState === "near"
                            ? "bg-warning"
                            : "bg-brand"
                      }`}
                      style={{
                        width: `${stats.fbChars > 0 ? Math.max(fbUsagePercent, 1) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopyFull}
                    disabled={!hasOutput}
                    className={primaryButtonClass}
                  >
                    Copy for Facebook
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText(text, "Text copied")}
                    disabled={!text.trim()}
                    className={secondaryButtonClass}
                  >
                    Copy text only
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText(hashtags.trim(), "Hashtags copied")}
                    disabled={!hashtags.trim()}
                    className={secondaryButtonClass}
                  >
                    Copy hashtags
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!hasOutput}
                    className={secondaryButtonClass}
                  >
                    Download .txt
                  </button>
                </div>
              </AppCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <AppCard label="Find & replace">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="find-input"
                      className="mb-1.5 block text-xs font-medium text-muted"
                    >
                      Find
                    </label>
                    <input
                      id="find-input"
                      type="text"
                      value={findQuery}
                      onChange={(event) => setFindQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          findNextMatch();
                        }
                      }}
                      placeholder="e.g. RSTW"
                      className={textInputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="replace-input"
                      className="mb-1.5 block text-xs font-medium text-muted"
                    >
                      Replace with
                    </label>
                    <input
                      id="replace-input"
                      type="text"
                      value={replaceQuery}
                      onChange={(event) => setReplaceQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          replaceNextMatch();
                        }
                      }}
                      placeholder="e.g. Science Week"
                      className={textInputClass}
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={findNextMatch} className={secondaryButtonClass}>
                    Find next
                  </button>
                  <button type="button" onClick={replaceNextMatch} className={secondaryButtonClass}>
                    Replace
                  </button>
                  <button type="button" onClick={replaceAllMatches} className={secondaryButtonClass}>
                    Replace all
                  </button>
                </div>
              </AppCard>
            </motion.div>
          </div>

          <motion.aside
            variants={staggerItem}
            aria-label="Bold tools and settings"
            className="space-y-5 lg:sticky lg:top-6"
          >
            <div className="hidden lg:block">
              <AppCard label="Bold tools" description={selectionHint}>
                {renderBoldStylePicker()}

                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onMouseDown={preventSelectionLoss}
                    onClick={() => void applyStyleAndMaybeCopy(activeStyle)}
                    className={`${primaryButtonClass} w-full justify-between`}
                  >
                    <span>Bold selection</span>
                    <span className="font-mono text-[11px] font-medium opacity-60">
                      Ctrl B
                    </span>
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onMouseDown={preventSelectionLoss}
                      onClick={() => convertCurrentLine(activeStyle)}
                      className={`${secondaryButtonClass} px-3`}
                    >
                      Bold line
                    </button>
                    <button
                      type="button"
                      onClick={() => convertAllText(activeStyle)}
                      disabled={!text.trim()}
                      className={`${secondaryButtonClass} px-3`}
                    >
                      Bold all text
                    </button>
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-5">
                  <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-faint">
                    Copy settings
                  </h3>
                  {settingsToggles}
                </div>
              </AppCard>
            </div>

            <div className="lg:hidden">
              <AppCard label="Copy settings">{settingsToggles}</AppCard>
            </div>
          </motion.aside>
        </motion.div>
      </div>

      <footer className="border-t border-border pb-36 pt-6 text-center text-xs text-faint lg:pb-6">
        DOST MIMAROPA · Developed by Darwin D. Melaya
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <button
            type="button"
            onMouseDown={preventSelectionLoss}
            onPointerDown={preventSelectionLoss}
            onClick={() => void applyStyleAndMaybeCopy(activeStyle)}
            className={`${primaryButtonClass} flex-1 py-3.5`}
          >
            Bold · {FONT_STYLE_LABELS[activeStyle].sample}
          </button>
          <button
            type="button"
            onClick={handleCopyFull}
            disabled={!hasOutput}
            className={`${secondaryButtonClass} py-3.5`}
          >
            Copy
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-6xl text-center text-[11px] text-faint">
          {selectionLength > 0
            ? `${selectionLength} characters ready to bold`
            : "Select text in the editor, then tap Bold"}
        </p>
      </div>

      <Toast message={toast} />
    </motion.div>
  );
};

export default MainPage;
