import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const defaultForm = { name: '', type: 'asset', balance: '' };

export default function AccountModal({ open, onClose, onSave, account }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(account
        ? { name: account.name, type: account.type, balance: account.balance }
        : defaultForm
      );
    }
  }, [open, account]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ ...form, balance: parseFloat(form.balance) });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay bg-black/60">
      <div className="w-full max-w-md animate-slide-up rounded-2xl border border-surface-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <h2 className="font-semibold text-[#e2eaf6]">
            {account ? 'Edit Account' : 'Add Account'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#7b9ab2] hover:bg-surface-elevated hover:text-[#e2eaf6]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="label">Account name</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Savings Account, Mortgage"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-elevated p-1">
              {['asset', 'liability'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`rounded-lg py-2 text-sm font-medium capitalize transition-all ${
                    form.type === t
                      ? t === 'asset'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                      : 'text-[#7b9ab2] hover:text-[#e2eaf6]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-[#7b9ab2]">
              {form.type === 'asset'
                ? 'Assets: bank accounts, investments, property, etc.'
                : 'Liabilities: loans, credit cards, mortgages, etc.'}
            </p>
          </div>

          <div>
            <label className="label">Current balance</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#7b9ab2]">$</span>
              <input
                type="number"
                step="0.01"
                value={form.balance}
                onChange={set('balance')}
                placeholder="0.00"
                className="input pl-7"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : account ? 'Save changes' : 'Add account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
