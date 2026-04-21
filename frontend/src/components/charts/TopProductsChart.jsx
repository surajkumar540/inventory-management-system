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

const TopProductsChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: "Units Sold",
        data: data.map((d) => d.totalSold),
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(180, 0, 0, 0);
          gradient.addColorStop(0, "rgba(99,102,241,0.8)");
          gradient.addColorStop(1, "rgba(139,92,246,0.3)");
          return gradient;
        },
        borderColor: "transparent",
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    ...chartDefaults,
    indexAxis: "y",
    scales: {
      x: { ...chartDefaults.scales.x },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
    },
  };

  return (
    <div className="h-28">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TopProductsChart;