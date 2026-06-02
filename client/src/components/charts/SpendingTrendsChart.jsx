import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function SpendingTrendsChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-[#606880]">No spending data yet</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => `${d.month} ${d.year}`),
    datasets: [
      {
        label: 'Expenses',
        data: data.map((d) => d.expenses),
        borderColor: '#e84057',
        backgroundColor: 'rgba(232, 64, 87, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#e84057',
        pointBorderColor: '#13151b',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Income',
        data: data.map((d) => d.income),
        borderColor: '#18c997',
        backgroundColor: 'rgba(24, 201, 151, 0.05)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#18c997',
        pointBorderColor: '#13151b',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
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
        grid: { display: false },
        ticks: { color: '#606880', font: { size: 11, family: 'Inter' } },
        border: { display: false },
      },
      y: {
        grid: { color: '#242831' },
        ticks: {
          color: '#606880',
          font: { size: 11, family: 'Inter' },
          callback: (v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`,
        },
        border: { display: false },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
