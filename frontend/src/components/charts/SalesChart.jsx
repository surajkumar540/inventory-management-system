import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { chartDefaults, colors } from "../../styles/tokens";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const SalesChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Orders",
        data: data.map((d) => d.totalSales),
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 180);
          gradient.addColorStop(0, "rgba(99,102,241,0.7)");
          gradient.addColorStop(1, "rgba(139,92,246,0.3)");
          return gradient;
        },
        borderColor: "transparent",
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    ...chartDefaults,
    scales: {
      ...chartDefaults.scales,
      y: {
        ...chartDefaults.scales.y,
        ticks: {
          ...chartDefaults.scales.y.ticks,
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="h-44">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SalesChart;