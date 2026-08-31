type ToastProps = {
  message: string | null;
};

const Toast = ({ message }: ToastProps) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-primary shadow-card">
        {message}
      </div>
    </div>
  );
};

export default Toast;
