import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay bg-black/60">
      <div className="w-full max-w-sm animate-slide-up rounded-2xl border border-surface-border bg-surface shadow-2xl">
        <div className="flex items-start gap-4 p-6">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/10">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#e2eaf6]">{title}</h3>
            <p className="mt-1 text-sm text-[#7b9ab2]">{message}</p>
          </div>
          <button onClick={onClose} className="text-[#7b9ab2] hover:text-[#e2eaf6]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-3 border-t border-surface-border px-6 py-4">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger flex-1 justify-center">
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
