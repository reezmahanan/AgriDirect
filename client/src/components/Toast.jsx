import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type || 'info'}`}>
          <div className="toast-icon">
            {t.type === 'success' && <CheckCircle2 size={18} />}
            {t.type === 'error' && <AlertCircle size={18} />}
            {(!t.type || t.type === 'info') && <Info size={18} />}
          </div>
          <div className="toast-msg">{t.message}</div>
          <button
            className="toast-close"
            onClick={() => onDismiss(t.id)}
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
