import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Analytics } from '../../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BiodiversityChartProps {
  analytics?: Analytics[];
}

export const BiodiversityChart: React.FC<BiodiversityChartProps> = ({ analytics = [] }) => {
  const labels = analytics.length > 0
    ? analytics.map((a) => new Date(a.recorded_at).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }))
    : ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'];

  const scores = analytics.length > 0
    ? analytics.map((a) => a.biodiversity_score)
    : [68.0, 72.5, 76.0, 81.2, 85.0, 89.4];

  const data = {
    labels,
    datasets: [
      {
        label: 'Biodiversity Index (0-100)',
        data: scores,
        backgroundColor: 'rgba(52, 211, 153, 0.8)',
        borderRadius: 6,
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
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar data={data} options={options} />
    </div>
  );
};
