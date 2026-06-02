import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function NetWorthChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-[#7b9ab2]">No data available</p>
      </div>
    );
  }

  const isGrowing = data.length > 1 && data[data.length - 1].netWorth >= data[0].netWorth;
  const lineColor = isGrowing ? '#10d9a0' : '#f43f5e';
  const fillColor = isGrowing ? 'rgba(16, 217, 160, 0.08)' : 'rgba(244, 63, 94, 0.08)';

  const chartData = {
    labels: data.map((d) => `${d.month} ${d.year}`),
    datasets: [
      {
        data: data.map((d) => d.netWorth),
        borderColor: lineColor,
        backgroundColor: fillColor,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: lineColor,
        pointBorderColor: '#0e1b2e',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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

  return <Line data={chartData} options={options} />;
}
