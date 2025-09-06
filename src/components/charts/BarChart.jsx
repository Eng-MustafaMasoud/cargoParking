import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({
  data,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "Inter, system-ui, sans-serif",
          },
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: "bold",
          family: "Inter, system-ui, sans-serif",
        },
        color: "#1F2937",
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 13,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: showGrid,
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
            family: "Inter, system-ui, sans-serif",
          },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          display: showGrid,
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
            family: "Inter, system-ui, sans-serif",
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  // Process data to ensure it has the right format
  const chartData = {
    labels: data?.map((item) => item.name || item.label) || [],
    datasets:
      data?.map((item, index) => ({
        label: item.name || `Dataset ${index + 1}`,
        data: [item.value || item.occupied || item.available || 0],
        backgroundColor: colors[index % colors.length] + "20",
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      })) || [],
  };

  // If data is an array of objects with multiple values, process differently
  if (data && data.length > 0 && data[0].occupied !== undefined) {
    const labels = data.map((item) => item.name);
    const occupiedData = data.map((item) => item.occupied || 0);
    const availableData = data.map((item) => item.available || 0);

    chartData.labels = labels;
    chartData.datasets = [
      {
        label: "Occupied",
        data: occupiedData,
        backgroundColor: colors[0] + "20",
        borderColor: colors[0],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Available",
        data: availableData,
        backgroundColor: colors[1] + "20",
        borderColor: colors[1],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ];
  }

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
