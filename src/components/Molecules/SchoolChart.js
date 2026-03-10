"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const SchoolChart = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Monthly Attendance %",
        data: [85, 88, 75, 90, 95, 82],
        fill: true,
        backgroundColor: "rgba(13, 110, 253, 0.2)",
        borderColor: "rgb(13, 110, 253)",
        tension: 0.4, // Isse lines smooth ho jati hain
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return (
    <div
      className="card border-0 shadow-sm p-3"
      style={{ borderRadius: "15px" }}
    >
      <h5 className="fw-bold mb-3">Attendance Overview</h5>
      <Line data={data} options={options} />
    </div>
  );
};

export default SchoolChart;
