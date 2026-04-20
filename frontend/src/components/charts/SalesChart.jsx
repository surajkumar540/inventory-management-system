import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { chartDefaults, colors } from "../../styles/tokens";
prof

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const SalesChart = ({ data = [] }) => {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [{
      label: "Sales",
      data: data.map((d) => d.totalSales),
      backgroundColor: colors.primaryBg,
      borderColor: colors.primary,
      borderWidth: 1.5,
      borderRadius: 6,
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
          stepSize: 1,
        },
      },
    },
  };

  return <div className="h-44"><Bar data={chartData} options={options} /></div>;
};

export default SalesChart;