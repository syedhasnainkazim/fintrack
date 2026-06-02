import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import AccountModal from '../components/AccountModal';
import ConfirmModal from '../components/ConfirmModal';
import NetWorthChart from '../components/charts/NetWorthChart';
import toast from 'react-hot-toast';

export default function NetWorth() {
  const { user } = useAuth();
  const [data, setData] = useState({ accounts: [], totalAssets: 0, totalLiabilities: 0, netWorth: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [deleteAccount, setDeleteAccount] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [acc, hist] = await Promise.all([
        api.get('/accounts'),
        api.get('/stats/net-worth-history'),
      ]);
      setData(acc.data);
      setHistory(hist.data);
    } catch {
      toast.error('Failed to load account data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (formData) => {
    if (editAccount) {
      await api.put(`/accounts/${editAccount.id}`, formData);
      toast.success('Account updated');
    } else {
      await api.post('/accounts', formData);
      toast.success('Account added');
    }
    setEditAccount(null);
    load();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/accounts/${deleteAccount.id}`);
      toast.success('Account deleted');
      setDeleteAccount(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  const assets = data.accounts.filter((a) => a.type === 'asset');
  const liabilities = data.accounts.filter((a) => a.type === 'liability');
  const isPositive = data.netWorth >= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#e2eaf6]">Net Worth</h1>
          <p className="text-sm text-[#7b9ab2]">Assets minus liabilities</p>
        </div>
        <button onClick={() => { setEditAccount(null); setModal(true); }} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add account
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total assets', value: data.totalAssets, color: 'text-emerald-400', icon: <TrendingUp className="h-4 w-4" /> },
          { label: 'Total liabilities', value: data.totalLiabilities, color: 'text-rose-400', icon: <TrendingDown className="h-4 w-4" /> },
          { label: 'Net worth', value: data.netWorth, color: isPositive ? 'text-navy-400' : 'text-rose-400', icon: null },
        ].map((s) => (
          <div key={s.label} className={`card ${s.label === 'Net worth' ? 'border-navy-400/20' : ''}`}>
            <p className="text-xs text-[#7b9ab2] uppercase tracking-wide">{s.label}</p>
            <p className={`mt-2 text-2xl font-bold ${s.color}`}>
              {loading ? '—' : formatCurrency(s.value, user?.currency)}
            </p>
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#e2eaf6]">Net Worth Over Time</h2>
            <span className="text-xs text-[#7b9ab2]">Last 12 months</span>
          </div>
          <div className="h-64">
            <NetWorthChart data={history} />
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {[
          { title: 'Assets', list: assets, type: 'asset', color: 'emerald', emoji: '💰', total: data.totalAssets },
          { title: 'Liabilities', list: liabilities, type: 'liability', color: 'rose', emoji: '💳', total: data.totalLiabilities },
        ].map(({ title, list, type, color, emoji, total }) => (
          <div key={title} className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#e2eaf6]">{title}</h2>
              <span className={`text-sm font-semibold ${type === 'asset' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(total, user?.currency)}
              </span>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => <div key={i} className="shimmer h-14 rounded-xl bg-surface-elevated" />)}
              </div>
            ) : list.length === 0 ? (
              <div className="rounded-xl border border-dashed border-surface-border py-8 text-center">
                <span className="text-2xl">{emoji}</span>
                <p className="mt-2 text-sm text-[#7b9ab2]">
                  No {title.toLowerCase()} yet.{' '}
                  <button
                    onClick={() => {
                      setEditAccount({ type });
                      setModal(true);
                    }}
                    className="text-navy-400 hover:text-navy-300"
                  >
                    Add one →
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {list.map((acc) => (
                  <div key={acc.id} className="group flex items-center justify-between rounded-xl bg-surface-elevated px-4 py-3 transition-colors hover:bg-navy-950/50">
                    <div>
                      <p className="text-sm font-medium text-[#e2eaf6]">{acc.name}</p>
                      <p className="text-xs capitalize text-[#7b9ab2]">{acc.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${type === 'asset' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatCurrency(parseFloat(acc.balance), user?.currency)}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditAccount(acc); setModal(true); }}
                          className="rounded-md p-1 text-[#7b9ab2] hover:text-[#e2eaf6]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteAccount(acc)}
                          className="rounded-md p-1 text-[#7b9ab2] hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <AccountModal
        open={modal}
        onClose={() => { setModal(false); setEditAccount(null); }}
        onSave={handleSave}
        account={editAccount?.id ? editAccount : null}
      />
      <ConfirmModal
        open={!!deleteAccount}
        onClose={() => setDeleteAccount(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete account?"
        message={`This will permanently delete "${deleteAccount?.name}". This action cannot be undone.`}
      />
    </div>
  );
}
