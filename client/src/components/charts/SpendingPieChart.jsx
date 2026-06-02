import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CHART_COLORS, getCategoryInfo } from '../../utils/constants';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SpendingPieChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-sm text-[#7b9ab2]">No expenses this month</p>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.amount, 0);

  const chartData = {
    labels: data.map((d) => getCategoryInfo(d.category).label),
    datasets: [
      {
        data: data.map((d) => d.amount),
        backgroundColor: CHART_COLORS.slice(0, data.length).map((c) => c + 'cc'),
        borderColor: CHART_COLORS.slice(0, data.length),
        borderWidth: 1.5,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#152236',
        borderColor: '#1e3248',
        borderWidth: 1,
        titleColor: '#e2eaf6',
        bodyColor: '#7b9ab2',
        padding: 12,
        callbacks: {
          label: (ctx) => ` $${ctx.raw.toLocaleString()} (${((ctx.raw / total) * 100).toFixed(1)}%)`,
        },
      },
    },
  };

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1">
        <Doughnut data={chartData} options={options} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-[#7b9ab2]">Total</p>
          <p className="text-lg font-bold text-[#e2eaf6]">${total.toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-4 space-y-1.5 max-h-28 overflow-y-auto">
        {data.slice(0, 5).map((d, i) => (
          <div key={d.category} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: CHART_COLORS[i] }}
              />
              <span className="text-[#7b9ab2] truncate">{getCategoryInfo(d.category).label}</span>
            </div>
            <span className="font-medium text-[#e2eaf6]">${d.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
