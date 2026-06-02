import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CashFlowChart({ data = [] }) {
  const labels = data.map((d) => d.month);
  const incomeData = data.map((d) => d.income);
  const expenseData = data.map((d) => d.expenses);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(16, 217, 160, 0.7)',
        borderColor: 'rgba(16, 217, 160, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: expenseData,
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderColor: 'rgba(244, 63, 94, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#7b9ab2',
          font: { size: 12, family: 'Inter' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#152236',
        borderColor: '#1e3248',
        borderWidth: 1,
        titleColor: '#e2eaf6',
        bodyColor: '#7b9ab2',
        padding: 12,
        callbacks: {
          label: (ctx) => ` $${ctx.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#7b9ab2', font: { size: 11, family: 'Inter' } },
        border: { display: false },
      },
      y: {
        grid: { color: '#1e3248' },
        ticks: {
          color: '#7b9ab2',
          font: { size: 11, family: 'Inter' },
          callback: (v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`,
        },
        border: { display: false },
      },
    },
  };

  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-[#7b9ab2]">No transaction data yet</p>
      </div>
    );
  }

  return <Bar data={chartData} options={options} />;
}
