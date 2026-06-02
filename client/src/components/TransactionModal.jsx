import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants';

const today = () => new Date().toISOString().split('T')[0];

const defaultForm = { type: 'expense', category: '', description: '', amount: '', date: today() };

export default function TransactionModal({ open, onClose, onSave, transaction }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (transaction) {
        setForm({
          type: transaction.type,
          category: transaction.category,
          description: transaction.description || '',
          amount: transaction.amount,
          date: transaction.date?.split('T')[0] || today(),
        });
      } else {
        setForm(defaultForm);
      }
    }
  }, [open, transaction]);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm((f) => ({
      ...f,
      [field]: val,
      ...(field === 'type' ? { category: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) return;
    setLoading(true);
    try {
      await onSave({ ...form, amount: parseFloat(form.amount) });
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
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#7b9ab2] hover:bg-surface-elevated hover:text-[#e2eaf6] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-elevated p-1">
            {['expense', 'income'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t, category: '' }))}
                className={`rounded-lg py-2 text-sm font-medium capitalize transition-all ${
                  form.type === t
                    ? t === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                    : 'text-[#7b9ab2] hover:text-[#e2eaf6]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={set('category')} className="input" required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#7b9ab2]">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={set('amount')}
                placeholder="0.00"
                className="input pl-7"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Date</label>
            <input type="date" value={form.date} onChange={set('date')} className="input" required />
          </div>

          <div>
            <label className="label">Description <span className="text-[#7b9ab2] normal-case font-normal">(optional)</span></label>
            <input
              type="text"
              value={form.description}
              onChange={set('description')}
              placeholder="What was this for?"
              className="input"
              maxLength={200}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : transaction ? 'Save changes' : 'Add transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
