import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, LineElement, CategoryScale,
  LinearScale, PointElement, Tooltip, Legend, Filler,
} from "chart.js";
import { chartDefaults, colors } from "../../styles/tokens";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const RevenueChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [{
      label: "Revenue (₹)",
      data: data.map((d) => d.totalRevenue),
      borderColor: colors.primary,
      backgroundColor: colors.primaryBg,
      fill: true, tension: 0.4, borderWidth: 2,
      pointBackgroundColor: colors.primary,
      pointRadius: 4, pointHoverRadius: 6,
    }],
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

  return <div className="h-44"><Line data={chartData} options={options} /></div>;
};

export default RevenueChart;