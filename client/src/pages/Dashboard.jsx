import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryInfo } from '../utils/constants';
import StatCard from '../components/StatCard';
import CashFlowChart from '../components/charts/CashFlowChart';
import SpendingPieChart from '../components/charts/SpendingPieChart';
import SpendingTrendsChart from '../components/charts/SpendingTrendsChart';
import TransactionModal from '../components/TransactionModal';
import toast from 'react-hot-toast';


export default function Dashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [cashflow, setCashflow] = useState([]);
  const [spending, setSpending] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txModal, setTxModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const [ov, cf, sp, tx, bg] = await Promise.all([
        api.get('/stats/overview'),
        api.get('/stats/cashflow?months=8'),
        api.get('/stats/spending-by-category'),
        api.get('/transactions?limit=5'),
        api.get('/budgets'),
      ]);
      setOverview(ov.data);
      setCashflow(cf.data);
      setSpending(sp.data);
      setRecentTx(tx.data.transactions);
      setBudgets(bg.data.slice(0, 4));
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAddTransaction = async (data) => {
    await api.post('/transactions', data);
    toast.success('Transaction added');
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#c9d1e0]">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h1>
          <p className="text-sm text-[#606880]">
            {user?.name}
          </p>
        </div>
        <button onClick={() => setTxModal(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add transaction
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Income"
          value={formatCurrency(overview?.income, user?.currency)}
          change={overview?.changes?.income}
          color="green"
          loading={loading}
        />
        <StatCard
          label="Expenses"
          value={formatCurrency(overview?.expenses, user?.currency)}
          change={overview?.changes?.expenses}
          color="red"
          loading={loading}
        />
        <StatCard
          label="Saved"
          value={formatCurrency(overview?.savings, user?.currency)}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Net worth"
          value={formatCurrency(overview?.netWorth, user?.currency)}
          color="purple"
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#c9d1e0]">Cash Flow</h2>
            <span className="text-xs text-[#606880]">Last 8 months</span>
          </div>
          <div className="h-56">
            <CashFlowChart data={cashflow} />
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#c9d1e0]">Spending by Category</h2>
            <span className="text-xs text-[#606880]">This month</span>
          </div>
          <div className="h-56">
            <SpendingPieChart data={spending} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-[#c9d1e0]">Spending Trends</h2>
          <span className="text-xs text-[#606880]">Income vs expenses over time</span>
        </div>
        <div className="h-52">
          <SpendingTrendsChart data={cashflow} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#c9d1e0]">Recent Transactions</h2>
            <Link to="/transactions" className="flex items-center gap-1 text-xs font-medium text-[#4e7cf6] hover:text-[#6b96f8] transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="shimmer h-12 rounded-lg bg-surface-elevated" />
              ))}
            </div>
          ) : recentTx.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-[#606880]">No transactions yet.</p>
              <button onClick={() => setTxModal(true)} className="mt-2 text-sm text-[#4e7cf6] hover:text-[#6b96f8]">
                Add your first transaction →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {recentTx.map((tx) => {
                const cat = getCategoryInfo(tx.category);
                return (
                  <div key={tx.id} className="flex items-center gap-4 py-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-lg">
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-[#c9d1e0]">
                        {tx.description || cat.label}
                      </p>
                      <p className="text-xs text-[#606880]">{cat.label} · {formatDate(tx.date)}</p>
                    </div>
                    <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-[#18c997]' : 'text-[#e84057]'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, user?.currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#c9d1e0]">Budget Overview</h2>
            <Link to="/budgets" className="flex items-center gap-1 text-xs font-medium text-[#4e7cf6] hover:text-[#6b96f8] transition-colors">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-10 rounded-lg bg-surface-elevated" />)}
            </div>
          ) : budgets.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-[#606880]">No budgets set up.</p>
              <Link to="/budgets" className="mt-2 text-sm text-[#4e7cf6] hover:text-[#6b96f8] block">
                Create your first budget →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((b) => {
                const cat = getCategoryInfo(b.category);
                const pct = Math.min((b.spent / parseFloat(b.amount)) * 100, 100);
                const over = b.spent > parseFloat(b.amount);
                return (
                  <div key={b.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm text-[#c9d1e0]">
                        <span>{cat.emoji}</span> {cat.label}
                      </span>
                      <span className={`text-xs font-medium ${over ? 'text-[#e84057]' : 'text-[#606880]'}`}>
                        ${b.spent.toLocaleString()} / ${parseFloat(b.amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                      <div
                        className={`h-full rounded-full transition-all ${over ? 'bg-[#e84057]' : pct > 80 ? 'bg-[#e8a020]' : 'bg-[#4e7cf6]'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <TransactionModal open={txModal} onClose={() => setTxModal(false)} onSave={handleAddTransaction} />
    </div>
  );
}
