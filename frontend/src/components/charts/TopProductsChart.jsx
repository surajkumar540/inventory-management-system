import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { chartDefaults, colors } from "../../styles/tokens";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TopProductsChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [{
      label: "Units Sold",
      data: data.map((d) => d.totalSold),
      backgroundColor: colors.primaryBg,
      borderColor: colors.primary,
      borderWidth: 1.5,
      borderRadius: 8,
    }],
  };

  const options = {
    ...chartDefaults,
    indexAxis: "y",
    scales: {
      x: chartDefaults.scales.x,
      y: { grid: { display: false }, ticks: chartDefaults.scales.y.ticks },
    },
  };

  return <div className="h-28"><Bar data={chartData} options={options} /></div>;
};

export default TopProductsChart;