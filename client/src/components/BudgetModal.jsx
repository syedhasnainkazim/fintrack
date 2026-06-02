import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../utils/constants';

const defaultForm = { category: '', amount: '', period: 'monthly' };

export default function BudgetModal({ open, onClose, onSave, budget, existingCategories = [] }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(budget
        ? { category: budget.category, amount: budget.amount, period: budget.period }
        : defaultForm
      );
    }
  }, [open, budget]);

  const availableCategories = budget
    ? EXPENSE_CATEGORIES
    : EXPENSE_CATEGORIES.filter((c) => !existingCategories.includes(c.value));

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
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
            {budget ? 'Edit Budget' : 'Add Budget'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#7b9ab2] hover:bg-surface-elevated hover:text-[#e2eaf6]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={set('category')} className="input" required disabled={!!budget}>
              <option value="">Select expense category</option>
              {availableCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
            {availableCategories.length === 0 && !budget && (
              <p className="mt-1 text-xs text-[#7b9ab2]">All categories already have budgets.</p>
            )}
          </div>

          <div>
            <label className="label">Monthly budget amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#7b9ab2]">$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={form.amount}
                onChange={set('amount')}
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
              ) : budget ? 'Save changes' : 'Add budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
