import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, type Transition } from "framer-motion";
import PageHeader from "../../components/layout/PageHeader";
import AppCard from "../../components/ui/AppCard";
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
  "rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted transition hover:border-border-strong hover:bg-input hover:text-primary disabled:opacity-30";

const mobileBoldButtonClass =
  "rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold text-primary transition active:scale-[0.98]";

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
    setTimeout(() => setToast(null), 2200);
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

  const inputClassName =
    "w-full resize-y rounded-xl border border-border bg-input p-4 text-base text-primary outline-none placeholder:text-faint focus:border-border-strong focus:ring-1 focus:ring-border select-text touch-manipulation sm:text-sm";

  const renderBoldStylePicker = (compact = false) => (
    <div className={`flex gap-2 ${compact ? "touch-pan-x overflow-x-auto pb-1" : "flex-col space-y-2"}`}>
      {FANCY_FONT_STYLES.map((style) => {
        const { label, sample, hint } = FONT_STYLE_LABELS[style];
        const isActive = activeStyle === style;

        if (compact) {
          return (
            <button
              key={style}
              type="button"
              onMouseDown={preventSelectionLoss}
              onPointerDown={preventSelectionLoss}
              onClick={() => setActiveStyle(style)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${
                isActive
                  ? "border-border-strong bg-accent text-accent-text"
                  : "border-border bg-card text-primary"
              }`}
            >
              <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-80">
                {label}
              </span>
              <span className="block text-lg leading-none">{sample}</span>
            </button>
          );
        }

        return (
          <button
            key={style}
            type="button"
            onClick={() => setActiveStyle(style)}
            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
              isActive
                ? "border-border-strong bg-accent-soft"
                : "border-border bg-card hover:border-border-strong"
            }`}
          >
            <span
              className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                isActive ? "border-primary" : "border-border-strong"
              }`}
            >
              {isActive && <span className="h-2 w-2 rounded-full bg-primary" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-primary">{label}</span>
              <span className="mt-0.5 block text-lg leading-none">{sample}</span>
              <span className="mt-1 block text-xs text-faint">{hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <motion.div
      className="min-h-screen bg-page text-primary"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 pb-32 sm:px-6 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: smoothEase }}
        >
          <PageHeader
            showHomeLink
            title="Font Generator"
            description="Paste pubmat copy, bold key phrases with Unicode fonts, add hashtags, copy straight to Facebook."
          >
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted">
                {stats.chars} chars
              </span>
              <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted">
                {stats.words} words
              </span>
              <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted">
                {stats.lines} lines
              </span>
              <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted">
                {stats.hashtagCount} hashtags
              </span>
              <span
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  stats.fbRemaining < 0
                    ? "border-red-500/40 bg-red-500/10 text-red-500"
                    : stats.fbRemaining < 500
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-border bg-card text-muted"
                }`}
              >
                FB {stats.fbChars.toLocaleString()} / {FACEBOOK_CHAR_LIMIT.toLocaleString()}
              </span>
            </div>
          </PageHeader>
        </motion.div>

        <motion.div
          className="grid gap-5 lg:grid-cols-[1fr_340px]"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div className="space-y-5" variants={staggerItem}>
            <motion.div variants={staggerItem}>
            <AppCard label="Text Editor">
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className={toolbarButtonClass}
                >
                  Undo
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className={toolbarButtonClass}
                >
                  Redo
                </button>
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
                <button
                  type="button"
                  onClick={handleClear}
                  className={toolbarButtonClass}
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => convertCurrentLine(activeStyle)}
                  className={toolbarButtonClass}
                >
                  Bold current line
                </button>
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
              </div>

              <textarea
                ref={textareaRef}
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={handleKeyDown}
                onSelect={captureSelection}
                onKeyUp={captureSelection}
                onMouseUp={captureSelection}
                onFocus={captureSelection}
                placeholder="Paste or type your pubmat text here..."
                rows={14}
                className={`${inputClassName} min-h-[220px] leading-relaxed lg:min-h-[360px]`}
              />

              <div className="mt-3 space-y-3 rounded-xl border border-border bg-card p-3 lg:hidden">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
                    Bold tools
                  </p>
                  <span className="text-xs text-muted">
                    {selectionLength > 0
                      ? `${selectionLength} chars selected`
                      : "Highlight text first"}
                  </span>
                </div>

                {renderBoldStylePicker(true)}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onMouseDown={preventSelectionLoss}
                    onPointerDown={preventSelectionLoss}
                    onClick={() => void applyStyleAndMaybeCopy(activeStyle)}
                    className="col-span-2 rounded-xl bg-accent py-3 text-sm font-semibold text-accent-text transition active:scale-[0.98]"
                  >
                    Bold selection · {FONT_STYLE_LABELS[activeStyle].label}
                  </button>
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
                    className={`${mobileBoldButtonClass} disabled:opacity-30`}
                  >
                    Undo
                  </button>
                </div>
              </div>

              <p className="mt-3 text-xs text-faint">
                <span className="hidden lg:inline">
                  Ctrl+B toggle bold · Ctrl+Z undo · Ctrl+Y redo · Draft auto-saves
                </span>
                <span className="lg:hidden">
                  Highlight text, pick style, tap Bold · Draft auto-saves
                </span>
              </p>
            </AppCard>
            </motion.div>

            <motion.div variants={staggerItem}>
            <AppCard label="Hashtags">
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleClearHashtags}
                  disabled={!hashtags.trim()}
                  className={toolbarButtonClass}
                >
                  Clear hashtags
                </button>
              </div>
              <textarea
                value={hashtags}
                onChange={(event) => setHashtags(event.target.value)}
                placeholder="#2026MIMAROPARSTW #DOSTMIMAROPA #SUSTAINMIMAROPA"
                rows={3}
                className={inputClassName}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {HASHTAG_PRESETS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addHashtag(tag)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      hashtags.includes(tag)
                        ? "border-border-strong bg-accent-soft text-primary"
                          : "border-border bg-card text-muted hover:border-border-strong hover:bg-input hover:text-primary"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </AppCard>
            </motion.div>

            <motion.div variants={staggerItem}>
            <AppCard label="Preview">
              <div className="min-h-32 whitespace-pre-wrap rounded-xl border border-border bg-input p-4 text-sm leading-relaxed text-primary">
                {getFullOutput() || (
                  <span className="text-faint">
                    Your formatted pubmat preview appears here...
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopyFull}
                  disabled={!getFullOutput().trim()}
                  className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-text transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Copy for Facebook
                </button>
                <button
                  type="button"
                  onClick={() => copyText(text, "Text copied")}
                  disabled={!text.trim()}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted transition hover:border-border-strong hover:bg-input hover:text-primary disabled:opacity-40"
                >
                  Copy text only
                </button>
                <button
                  type="button"
                  onClick={() => copyText(hashtags.trim(), "Hashtags copied")}
                  disabled={!hashtags.trim()}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted transition hover:border-border-strong hover:bg-input hover:text-primary disabled:opacity-40"
                >
                  Copy hashtags
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!getFullOutput().trim()}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted transition hover:border-border-strong hover:bg-input hover:text-primary disabled:opacity-40"
                >
                  Download .txt
                </button>
              </div>
            </AppCard>
            </motion.div>

            <motion.div variants={staggerItem}>
            <AppCard label="Find & Replace">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={findQuery}
                  onChange={(event) => setFindQuery(event.target.value)}
                  placeholder="Find..."
                  className="rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-primary outline-none placeholder:text-faint focus:border-border-strong"
                />
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(event) => setReplaceQuery(event.target.value)}
                  placeholder="Replace with..."
                  className="rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-primary outline-none placeholder:text-faint focus:border-border-strong"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={findNextMatch} className={toolbarButtonClass}>
                  Find next
                </button>
                <button type="button" onClick={replaceNextMatch} className={toolbarButtonClass}>
                  Replace
                </button>
                <button type="button" onClick={replaceAllMatches} className={toolbarButtonClass}>
                  Replace all
                </button>
              </div>
            </AppCard>
            </motion.div>
          </motion.div>

          <motion.div className="space-y-5" variants={staggerItem}>
            <div className="hidden space-y-5 lg:block">
            <motion.div variants={staggerItem}>
            <AppCard label="Font Style">
              {renderBoldStylePicker()}
            </AppCard>
            </motion.div>

            <motion.div variants={staggerItem}>
            <AppCard label="Apply Bold">
              <div className="space-y-2">
                {FANCY_FONT_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => applyStyleAndMaybeCopy(style)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-left text-sm font-medium text-muted transition hover:border-border-strong hover:bg-input hover:text-primary"
                  >
                    Bold selection · {FONT_STYLE_LABELS[style].label}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
                  Convert all
                </p>
                {FANCY_FONT_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => convertAllText(style)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2 text-left text-xs font-medium text-muted transition hover:border-border-strong hover:bg-input hover:text-primary"
                  >
                    Entire text → {FONT_STYLE_LABELS[style].label}
                  </button>
                ))}
              </div>
            </AppCard>
            </motion.div>
            </div>

            <motion.div variants={staggerItem}>
            <AppCard label="Settings">
              <div className="space-y-4">
                <Toggle
                  label="Auto-copy after bold"
                  checked={autoCopy}
                  onChange={setAutoCopy}
                />
                <Toggle
                  label="Include hashtags on copy"
                  checked={includeHashtagsOnCopy}
                  onChange={setIncludeHashtagsOnCopy}
                />
              </div>
            </AppCard>
            </motion.div>

            <motion.div variants={staggerItem}>
            <AppCard label="Shortcuts">
              <ul className="space-y-2 text-xs text-faint">
                <li className="flex justify-between gap-4">
                  <span className="text-muted">Toggle bold on selection</span>
                  <kbd className="rounded border border-border bg-input px-2 py-0.5 font-mono text-primary">
                    Ctrl+B
                  </kbd>
                </li>
                <li className="flex justify-between gap-4">
                  <span className="text-muted">Undo</span>
                  <kbd className="rounded border border-border bg-input px-2 py-0.5 font-mono text-primary">
                    Ctrl+Z
                  </kbd>
                </li>
                <li className="flex justify-between gap-4">
                  <span className="text-muted">Redo</span>
                  <kbd className="rounded border border-border bg-input px-2 py-0.5 font-mono text-primary">
                    Ctrl+Y
                  </kbd>
                </li>
              </ul>
            </AppCard>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 backdrop-blur-lg lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <button
            type="button"
            onMouseDown={preventSelectionLoss}
            onPointerDown={preventSelectionLoss}
            onClick={() => void applyStyleAndMaybeCopy(activeStyle)}
            className="flex-1 rounded-xl bg-accent py-3.5 text-sm font-semibold text-accent-text active:scale-[0.98]"
          >
            Bold · {FONT_STYLE_LABELS[activeStyle].sample}
          </button>
          <button
            type="button"
            onClick={handleCopyFull}
            disabled={!getFullOutput().trim()}
            className="rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-primary disabled:opacity-40"
          >
            Copy
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-6xl text-center text-[10px] text-faint">
          {selectionLength > 0
            ? `${selectionLength} characters ready to bold`
            : "Select text in the editor, then tap Bold"}
        </p>
      </div>

      <footer className="border-t border-border py-6 text-center text-xs text-faint">
        Developed by: Darwin D. Melaya
      </footer>

      <Toast message={toast} />
    </motion.div>
  );
};

export default MainPage;
