import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TreeCoverChartProps {
  treeCoverPercentage?: number;
}

export const TreeCoverChart: React.FC<TreeCoverChartProps> = ({ treeCoverPercentage = 78.5 }) => {
  const data = {
    labels: ['Dense Tree Cover', 'Open Canopy / Grassland', 'Water / Bare Soil'],
    datasets: [
      {
        data: [treeCoverPercentage, Math.max(0, 100 - treeCoverPercentage - 5), 5],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
          padding: 15,
        },
      },
    },
  };

  return (
    <div className="h-64 w-full relative flex items-center justify-center">
      <Doughnut data={data} options={options} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-8 text-center pointer-events-none">
        <span className="text-2xl font-bold text-white">{treeCoverPercentage}%</span>
        <p className="text-[10px] text-slate-400 font-medium">Canopy Cover</p>
      </div>
    </div>
  );
};
