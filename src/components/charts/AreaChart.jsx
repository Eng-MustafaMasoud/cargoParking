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
  Filler
);

const AreaChart = ({
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
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
      },
      line: {
        tension: 0.4,
        borderWidth: 3,
      },
    },
  };

  // Process data to ensure it has the right format
  const chartData = {
    labels: data?.map((item) => item.name || item.label || item.time) || [],
    datasets:
      data?.map((item, index) => ({
        label: item.name || `Dataset ${index + 1}`,
        data: [item.value || item.revenue || item.amount || 0],
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + "20",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors[index % colors.length],
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: colors[index % colors.length],
        pointHoverBorderColor: "#fff",
      })) || [],
  };

  // If data is an array of objects with multiple values, process differently
  if (data && data.length > 0 && data[0].revenue !== undefined) {
    const labels = data.map((item) => item.name || item.time);
    const revenueData = data.map((item) => item.revenue || 0);
    const amountData = data.map((item) => item.amount || 0);

    chartData.labels = labels;
    chartData.datasets = [
      {
        label: "Revenue",
        data: revenueData,
        borderColor: colors[0],
        backgroundColor: colors[0] + "20",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors[0],
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: colors[0],
        pointHoverBorderColor: "#fff",
      },
      {
        label: "Amount",
        data: amountData,
        borderColor: colors[1],
        backgroundColor: colors[1] + "20",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors[1],
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: colors[1],
        pointHoverBorderColor: "#fff",
      },
    ];
  }

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default AreaChart;
