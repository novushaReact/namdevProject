import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import axios from "axios";

function CameraUtilisation() {
  const [chartOptions, setChartOptions] = useState({
    series: [],
    options: {
      chart: {
        type: "bar",
        height: 350,
        background: "#ffffff",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "20%",
          borderRadius: 2,
          distributed: true, // Enable distributed colors
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: Array.from({ length: 26 }, (_, i) => `${i + 1}`),
        title: {
          text: "Camera ID",
          style: {
            fontSize: "12px",
            fontWeight: 400,
          },
        },
        labels: {
          rotate: -45,
          style: {
            fontSize: "8px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        },
      },
      yaxis: {
        title: {
          text: "Status",
          style: {
            fontSize: "12px",
            fontWeight: 400,
          },
        },
        min: 0,
        max: 1,
        tickAmount: 1,
        labels: {
          formatter: function (val) {
            return val === 1 ? "Working" : "Not Working";
          },
        },
      },
      tooltip: {
        enabled: true,
        theme: "light",
        y: {
          formatter: function (value, { dataPointIndex }) {
            const cameraId = dataPointIndex + 1;
            return value === 1
              ? `Camera ${cameraId}: Working`
              : `Camera ${cameraId}: Not Working`;
          },
        },
      },
      title: {
        text: "Camera Status",
        align: "center",
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
      },
      grid: {
        show: false,
      },
      colors: [], // Dynamic colors will be set here
    },
  });

  useEffect(() => {
    async function fetchCameraUtilisation() {
      try {
        const response = await axios.get(
          "https://ng3m7737-8000.inc1.devtunnels.ms/camera_status"
        );

        const { camera_status } = response.data;

        // Default series data (all 0) and colors (all red)
        const seriesData = Array(26).fill(0); // 0 = Not Working
        const colors = Array(26).fill("#dc3545"); // Red for all bars

        // Update for cameras that are working
        camera_status.forEach((camera) => {
          const index = camera.camera_id - 1; // Adjust for zero-based index
          if (index >= 0 && index < 26) {
            seriesData[index] = 1; // Set to "Working"
            colors[index] = "#28a745"; // Green for "Working"
          }
        });

        setChartOptions((prevOptions) => ({
          ...prevOptions,
          series: [
            {
              name: "Camera Status",
              data: seriesData,
            },
          ],
          options: {
            ...prevOptions.options,
            colors: colors, // Set dynamic colors for bars
          },
        }));
      } catch (error) {
        console.error("Error fetching camera utilization data:", error);
      }
    }

    fetchCameraUtilisation();
  }, []);

  return (
    <div className="w-full bg-white rounded-lg p-4">
      <div className="mb-2">
        <h5 className="text-sm font-medium text-gray-700">Camera Utilisation</h5>
      </div>
      <div className="overflow-hidden">
        <ReactApexChart
          options={chartOptions.options}
          series={chartOptions.series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
}

export default CameraUtilisation;
