/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Filler,
  Tooltip,
  Legend
);

const LineChart = (props: { data: any }) => {
  const options: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
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
    },
  };

  return <Line data={props.data} options={options} />;
};

export default LineChart;
