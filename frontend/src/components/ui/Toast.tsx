import { AnimatePresence, motion } from "framer-motion";

type ToastProps = {
  message: string | null;
};

const Toast = ({ message }: ToastProps) => (
  <div
    role="status"
    aria-live="polite"
    className="pointer-events-none fixed inset-x-0 bottom-32 z-50 flex justify-center px-4 lg:bottom-8"
  >
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-text shadow-float"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default Toast;
