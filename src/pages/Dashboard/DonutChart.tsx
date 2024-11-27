/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ArcElement,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  Tooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register required chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = (props: { data: any }) => {
  // Prepare the chart data

  // Chart options
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
          },
          color: "#333",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
    cutout: "60%",
  };

  return <Doughnut data={props.data} options={options} />;
};

export default DonutChart;
