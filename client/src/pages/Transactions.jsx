import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryInfo, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import TransactionModal from '../components/TransactionModal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const ALL_CATS = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  const [filters, setFilters] = useState({ type: '', category: '', search: '' });
  const [applied, setApplied] = useState({ type: '', category: '', search: '' });

  const [txModal, setTxModal] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, ...applied });
      Object.keys(applied).forEach((k) => !applied[k] && params.delete(k));
      const res = await api.get(`/transactions?${params}`);
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, applied]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    if (editTx) {
      await api.put(`/transactions/${editTx.id}`, data);
      toast.success('Transaction updated');
    } else {
      await api.post('/transactions', data);
      toast.success('Transaction added');
    }
    setEditTx(null);
    load();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/transactions/${deleteTx.id}`);
      toast.success('Transaction deleted');
      setDeleteTx(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  const applyFilters = () => {
    setApplied(filters);
    setPage(1);
  };

  const clearFilters = () => {
    const empty = { type: '', category: '', search: '' };
    setFilters(empty);
    setApplied(empty);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);
  const hasFilters = applied.type || applied.category || applied.search;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#e2eaf6]">Transactions</h1>
          <p className="text-sm text-[#7b9ab2]">{total} total records</p>
        </div>
        <button onClick={() => { setEditTx(null); setTxModal(true); }} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add transaction
        </button>
      </div>

      <div className="card-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b9ab2]" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              placeholder="Search transactions..."
              className="input pl-9"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value, category: '' }))}
            className="input w-full sm:w-36"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className="input w-full sm:w-44"
          >
            <option value="">All categories</option>
            {(filters.type === 'income' ? INCOME_CATEGORIES : filters.type === 'expense' ? EXPENSE_CATEGORIES : ALL_CATS).map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button onClick={applyFilters} className="btn-primary whitespace-nowrap">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="btn-secondary whitespace-nowrap">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-surface-border">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="shimmer h-9 w-9 rounded-xl bg-surface-elevated" />
                <div className="flex-1 space-y-1.5">
                  <div className="shimmer h-3.5 w-48 rounded bg-surface-elevated" />
                  <div className="shimmer h-3 w-28 rounded bg-surface-elevated" />
                </div>
                <div className="shimmer h-4 w-20 rounded bg-surface-elevated" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-medium text-[#e2eaf6]">No transactions found</p>
            <p className="mt-1 text-sm text-[#7b9ab2]">
              {hasFilters ? 'Try adjusting your filters.' : 'Add your first transaction to get started.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 sm:grid">
              <span className="text-xs font-medium uppercase tracking-wide text-[#7b9ab2]">Transaction</span>
              <span className="w-24 text-right text-xs font-medium uppercase tracking-wide text-[#7b9ab2]">Date</span>
              <span className="w-24 text-right text-xs font-medium uppercase tracking-wide text-[#7b9ab2]">Amount</span>
              <span className="w-16" />
            </div>
            {transactions.map((tx) => {
              const cat = getCategoryInfo(tx.category);
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-elevated/50 group">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-lg">
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[#e2eaf6]">
                      {tx.description || cat.label}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                        {cat.label}
                      </span>
                      <span className="text-xs text-[#7b9ab2]">{formatDate(tx.date)}</span>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, user?.currency)}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditTx(tx); setTxModal(true); }}
                      className="rounded-lg p-1.5 text-[#7b9ab2] hover:bg-surface-elevated hover:text-[#e2eaf6] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTx(tx)}
                      className="rounded-lg p-1.5 text-[#7b9ab2] hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-surface-border px-4 py-3">
            <span className="text-xs text-[#7b9ab2]">
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="btn-secondary p-2 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="btn-secondary p-2 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        open={txModal}
        onClose={() => { setTxModal(false); setEditTx(null); }}
        onSave={handleSave}
        transaction={editTx}
      />
      <ConfirmModal
        open={!!deleteTx}
        onClose={() => setDeleteTx(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete transaction?"
        message={`This will permanently delete "${deleteTx?.description || getCategoryInfo(deleteTx?.category).label}". This action cannot be undone.`}
      />
    </div>
  );
}
