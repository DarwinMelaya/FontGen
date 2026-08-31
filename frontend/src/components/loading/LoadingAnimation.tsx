import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AppLogo from "../ui/AppLogo";

type LoadingAnimationProps = {
  onComplete: () => void;
  label?: string;
};

const LoadingAnimation = ({ onComplete, label = "Switching workspace" }: LoadingAnimationProps) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const dotTimer = window.setInterval(() => {
      setDots((current) => (current.length >= 3 ? "" : `${current}.`));
    }, 280);

    return () => window.clearInterval(dotTimer);
  }, []);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - ratio) ** 3;
      setProgress(Math.round(eased * 100));

      if (ratio < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        window.setTimeout(onComplete, 180);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-black text-white dark:bg-black dark:text-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[32px_32px]" />

      <motion.div
        animate={{ y: ["-120%", "220%"] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute inset-x-0 h-24 bg-linear-to-b from-transparent via-white/8 to-transparent"
      />

      <div className="relative z-10 w-full max-w-xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className="mb-10 flex items-center gap-4"
        >
          <motion.div
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <AppLogo className="h-12 w-auto" />
          </motion.div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">
              Pubmat Font Generator
            </p>
            <p className="text-sm font-medium text-white/70">{label}</p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="mb-3 font-mono text-sm font-bold uppercase tracking-[0.28em] text-white"
        >
          Loading{dots.padEnd(3, "\u00a0")}
        </motion.p>

        <div className="relative h-3 overflow-hidden rounded-full border border-white/90 bg-black p-[2px]">
          <motion.div
            className="relative h-full overflow-hidden rounded-full bg-white"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.15 }}
          >
            <motion.span
              animate={{ x: ["-120%", "320%"] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-black/25 to-transparent"
            />
          </motion.div>
        </div>

        <div className="mt-4 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-white/55">
          <motion.span
            key={progress}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {progress}%
          </motion.span>
          <span>Please wait</span>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 h-px origin-left bg-linear-to-r from-white/60 via-white/20 to-transparent"
        />
      </div>
    </motion.div>
  );
};

type LoadingOverlayProps = {
  show: boolean;
  onComplete: () => void;
  label?: string;
};

export const LoadingOverlay = ({ show, onComplete, label }: LoadingOverlayProps) => (
  <AnimatePresence>
    {show && <LoadingAnimation key={label} onComplete={onComplete} label={label} />}
  </AnimatePresence>
);

export default LoadingAnimation;
