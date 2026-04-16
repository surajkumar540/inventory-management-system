import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const TopProductsChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: "Quantity Sold",
        data: data.map((item) => item.totalSold),
        borderWidth: 1,
      },
    ],
  };

  return <Bar data={chartData} />;
};

export default TopProductsChart;