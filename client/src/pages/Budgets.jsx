import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { getCategoryInfo } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import BudgetModal from '../components/BudgetModal';
import ConfirmModal from '../components/ConfirmModal';
import BudgetAllocationChart from '../components/charts/BudgetAllocationChart';
import toast from 'react-hot-toast';

export default function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [deleteBudget, setDeleteBudget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/budgets');
      setBudgets(res.data);
    } catch {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    if (editBudget) {
      await api.put(`/budgets/${editBudget.id}`, data);
      toast.success('Budget updated');
    } else {
      await api.post('/budgets', data);
      toast.success('Budget created');
    }
    setEditBudget(null);
    load();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/budgets/${deleteBudget.id}`);
      toast.success('Budget deleted');
      setDeleteBudget(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  const totalBudgeted = budgets.reduce((s, b) => s + parseFloat(b.amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const existing = budgets.map((b) => b.category);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#c9d1e0]">Budgets</h1>
          <p className="text-sm text-[#606880]">Track spending against monthly limits</p>
        </div>
        <button onClick={() => { setEditBudget(null); setModal(true); }} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add budget
        </button>
      </div>

      {!loading && budgets.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total budgeted', value: formatCurrency(totalBudgeted, user?.currency), color: 'text-[#4e7cf6]' },
              { label: 'Total spent', value: formatCurrency(totalSpent, user?.currency), color: totalSpent > totalBudgeted ? 'text-[#e84057]' : 'text-[#18c997]' },
              { label: 'Remaining', value: formatCurrency(Math.max(totalBudgeted - totalSpent, 0), user?.currency), color: 'text-[#c9d1e0]' },
            ].map((s) => (
              <div key={s.label} className="card-sm">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#606880]">{s.label}</p>
                <p className={`mt-1.5 text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#c9d1e0]">Budget Allocation</h2>
              <span className="text-xs text-[#606880]">Spent vs. budgeted per category</span>
            </div>
            <div style={{ height: `${Math.max(budgets.length * 52, 160)}px` }}>
              <BudgetAllocationChart budgets={budgets} />
            </div>
          </div>
        </>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="shimmer mb-3 h-5 w-32 rounded bg-surface-elevated" />
              <div className="shimmer mb-4 h-8 w-24 rounded bg-surface-elevated" />
              <div className="shimmer h-2 w-full rounded-full bg-surface-elevated" />
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-400/10">
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="font-semibold text-[#e2eaf6]">No budgets yet</h3>
          <p className="mt-1 text-sm text-[#7b9ab2]">Set spending limits for each category to stay on track.</p>
          <button onClick={() => setModal(true)} className="btn-primary mx-auto mt-4">
            <Plus className="h-4 w-4" />
            Create your first budget
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => {
            const cat = getCategoryInfo(b.category);
            const spent = b.spent || 0;
            const amount = parseFloat(b.amount);
            const pct = Math.min((spent / amount) * 100, 100);
            const over = spent > amount;
            const near = !over && pct >= 80;

            return (
              <div key={b.id} className="card group relative transition-all hover:border-navy-400/20">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated text-xl">
                      {cat.emoji}
                    </div>
                    <div>
                      <p className="font-medium text-[#e2eaf6]">{cat.label}</p>
                      <p className="text-xs text-[#7b9ab2] capitalize">{b.period}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditBudget(b); setModal(true); }}
                      className="rounded-lg p-1.5 text-[#7b9ab2] hover:bg-surface-elevated hover:text-[#e2eaf6]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteBudget(b)}
                      className="rounded-lg p-1.5 text-[#7b9ab2] hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mb-2 flex items-end justify-between">
                  <span className={`text-2xl font-bold ${over ? 'text-rose-400' : 'text-[#e2eaf6]'}`}>
                    {formatCurrency(spent, user?.currency)}
                  </span>
                  <span className="text-sm text-[#7b9ab2]">of {formatCurrency(amount, user?.currency)}</span>
                </div>

                <div className="mb-2 h-2 overflow-hidden rounded-full bg-surface-elevated">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      over ? 'bg-rose-500' : near ? 'bg-amber-500' : 'bg-navy-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${over ? 'text-rose-400' : near ? 'text-amber-400' : 'text-[#7b9ab2]'}`}>
                    {over ? `$${(spent - amount).toFixed(0)} over` : `$${(amount - spent).toFixed(0)} remaining`}
                  </span>
                  {(over || near) && (
                    <AlertTriangle className={`h-3.5 w-3.5 ${over ? 'text-rose-400' : 'text-amber-400'}`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BudgetModal
        open={modal}
        onClose={() => { setModal(false); setEditBudget(null); }}
        onSave={handleSave}
        budget={editBudget}
        existingCategories={existing}
      />
      <ConfirmModal
        open={!!deleteBudget}
        onClose={() => setDeleteBudget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete budget?"
        message={`This will remove the ${getCategoryInfo(deleteBudget?.category).label} budget. Your transactions won't be affected.`}
      />
    </div>
  );
}
