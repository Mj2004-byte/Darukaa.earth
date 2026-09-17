import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Analytics } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CarbonTrendChartProps {
  analytics?: Analytics[];
}

export const CarbonTrendChart: React.FC<CarbonTrendChartProps> = ({ analytics = [] }) => {
  const labels = analytics.length > 0
    ? analytics.map((a) => new Date(a.recorded_at).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }))
    : ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'];

  const carbonData = analytics.length > 0
    ? analytics.map((a) => a.carbon_stock)
    : [180.5, 192.0, 205.4, 218.2, 230.1, 245.8];

  const sequestrationData = analytics.length > 0
    ? analytics.map((a) => a.carbon_sequestration)
    : [14.2, 15.8, 17.1, 18.5, 20.2, 21.8];

  const data = {
    labels,
    datasets: [
      {
        label: 'Carbon Stock (tCO2e/ha)',
        data: carbonData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Sequestration Rate (tCO2e/yr)',
        data: sequestrationData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
};
