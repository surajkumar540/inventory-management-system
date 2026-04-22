import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
} from "chart.js";
import { chartDefaults, colors } from "../../styles/tokens";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
);

const RevenueChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map((d) =>
      new Date(d.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
    ),
    datasets: [
      {
        label: "Revenue (₹)",
        data: data.map((d) => d.totalRevenue),
        borderColor: colors.primary,
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 180);
          gradient.addColorStop(0, "rgba(99,102,241,0.18)");
          gradient.addColorStop(1, "rgba(99,102,241,0)");
          return gradient;
        },
        fill: true,
        tension: 0.45,
        borderWidth: 2,
        pointBackgroundColor: "#fff",
        pointBorderColor: colors.primary,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
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
          callback: (v) => `₹${v / 1000}K`,
        },
      },
    },
  };

  return (
    <div className="h-44">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;
