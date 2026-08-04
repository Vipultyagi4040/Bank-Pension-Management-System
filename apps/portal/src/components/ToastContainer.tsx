import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

export const toastStore = {
  _listeners: new Set<((toasts: Toast[]) => void)>(),
  _toasts: [] as Toast[],
  subscribe(l: (toasts: Toast[]) => void) {
    this._listeners.add(l);
    return () => { this._listeners.delete(l); };
  },
  add(toast: Omit<Toast, "id">) {
    const t = { ...toast, id: Date.now().toString() };
    this._toasts = [...this._toasts, t];
    this._emit();
    setTimeout(() => this.remove(t.id), toast.duration ?? 4000);
  },
  remove(id: string) {
    this._toasts = this._toasts.filter((t) => t.id !== id);
    this._emit();
  },
  _emit() {
    this._listeners.forEach((l) => l(this._toasts));
  }
};

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    return toastStore.subscribe(setToasts);
  }, []);
  return toasts;
}

export default function ToastContainer() {
  const toasts = useToasts();

  const icon = (type: ToastType) => {
    switch (type) {
      case "success": return <CheckCircle size={20} />;
      case "error": return <AlertCircle size={20} />;
      case "info": return <Info size={20} />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type} show`}
        >
          <span className="toast-icon">{icon(t.type)}</span>
          <div className="toast-content">
            <div className="toast-title">{t.title}</div>
            {t.message && <div className="toast-message">{t.message}</div>}
          </div>
          <button
            className="toast-close"
            onClick={() => toastStore.remove(t.id)}
            style={{ background: "none", border: "none", fontSize: "1.2rem", lineHeight: 1 }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
