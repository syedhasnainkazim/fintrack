import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getCategoryInfo } from '../../utils/constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function BudgetAllocationChart({ budgets = [] }) {
  if (!budgets.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-[#606880]">No budgets set up yet</p>
      </div>
    );
  }

  const labels = budgets.map((b) => getCategoryInfo(b.category).label);
  const budgetAmounts = budgets.map((b) => parseFloat(b.amount));
  const spentAmounts = budgets.map((b) => b.spent || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Spent',
        data: spentAmounts,
        backgroundColor: spentAmounts.map((s, i) =>
          s > budgetAmounts[i] ? 'rgba(232, 64, 87, 0.85)' : 'rgba(78, 124, 246, 0.85)'
        ),
        borderColor: spentAmounts.map((s, i) =>
          s > budgetAmounts[i] ? '#e84057' : '#4e7cf6'
        ),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Budget',
        data: budgetAmounts,
        backgroundColor: 'rgba(78, 124, 246, 0.12)',
        borderColor: 'rgba(78, 124, 246, 0.3)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#606880',
          font: { size: 11, family: 'Inter' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#1a1d25',
        borderColor: '#242831',
        borderWidth: 1,
        titleColor: '#c9d1e0',
        bodyColor: '#606880',
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: $${ctx.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#242831' },
        ticks: {
          color: '#606880',
          font: { size: 11, family: 'Inter' },
          callback: (v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`,
        },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#606880', font: { size: 11, family: 'Inter' } },
        border: { display: false },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
