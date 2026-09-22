import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast toast-${t.type || 'info'} ${t.type || 'info'}`}>
          <div className="toast-icon">
            {t.type === 'success' && <CheckCircle2 size={20} />}
            {t.type === 'error' && <AlertCircle size={20} />}
            {(!t.type || t.type === 'info') && <Info size={20} />}
          </div>
          <div className="toast-msg">{t.message}</div>
          <button
            className="toast-close"
            onClick={() => onDismiss(t.id)}
            type="button"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
