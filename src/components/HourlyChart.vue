<script setup>
import { defineProps, computed } from 'vue'
// Import the Vue wrapper for Line charts
import { Line } from 'vue-chartjs'
// Import necessary Chart.js modules
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  
  // --- ADDED FIXES BELOW ---
  BarController, // Required for the 'type: "bar"' dataset
  Filler,        // Required for the 'fill: true' line dataset
  // --- ADDED FIXES ABOVE ---
  
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
} from 'chart.js'

// Register the required Chart.js components globally for this instance
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  
  // --- ADDED FIXES BELOW ---
  BarController, // Register the controller
  Filler,        // Register the plugin
  // --- ADDED FIXES ABOVE ---
  
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
)

// --- Props Setup ---
// Defines the required 'place' prop containing all weather data
const props = defineProps({
  place: {
    type: Object,
    required: true,
  },
})

// --- Computed Property for Chart Data ---
/**
 * Processes the raw hourly forecast data into a structure required by Chart.js.
 * Creates a dual-axis chart combining a Temperature line and Rain bar data.
 */
const chartData = computed(() => {
  // Get the hourly data array for the current day
  const hourlyData = props.place.forecast.forecastday[0].hour

  // Generate x-axis labels (Time)
  const labels = hourlyData.map((hour) => {
    // Format the time string to display only hour and minute (e.g., "02:00 PM")
    return new Date(hour.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  })

  // Extract Temperature data (°F)
  const temps = hourlyData.map((hour) => hour.temp_f)

  // Extract Rain data (precipitation in mm)
  const rain = hourlyData.map((hour) => hour.precip_mm)

  return {
    labels: labels,
    datasets: [
      // Dataset 1: Temperature (Line Chart)
      {
        type: 'line',
        label: 'Temperature (°F)',
        data: temps,
        borderColor: '#FFFFFF', // White line color
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent fill below line
        fill: true, // This option now works
        yAxisID: 'yTemp', // Use the left axis
        tension: 0.4, // Smooths the line curve
      },
      // Dataset 2: Rain Amount (Bar Chart)
      {
        type: 'bar', // This chart type now works
        label: 'Rain Amount (mm)',
        data: rain,
        backgroundColor: 'yellow', // Yellow bar color
        yAxisID: 'yRain', // Use the right axis
      },
    ],
  }
})

// --- Chart Options Configuration ---
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // Allows flexible height/width control via Tailwind classes
  plugins: {
    legend: {
      labels: {
        color: 'white', // Legend text color
      },
    },
    title: {
      display: true,
      text: 'Hourly Conditions',
      color: 'white', // Chart title color
    },
  },
  scales: {
    // X-Axis (Time) Configuration
    x: {
      ticks: { color: 'white' },
      grid: { color: 'rgba(255, 255, 255, 0.1)' }, // Faint grid lines
    },
    // Left Y-Axis (Temperature) Configuration
    yTemp: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Temp (°F)',
        color: 'white',
      },
      ticks: { color: 'white' },
      grid: { color: 'rgba(255, 255, 255, 0.2)' },
    },
    // Right Y-Axis (Rain) Configuration
    yRain: {
      type: 'linear',
      display: true,
      position: 'right',
      // Grid configuration for the Rain axis
      title: {
        display: true,
        text: 'Rain (mm)',
        color: 'yellow',
      },
      ticks: { color: 'yellow' },
      grid: { drawOnChartArea: false }, // Prevent drawing gridlines on the plot area
    },
  },
}
</script>

<template>
  <div class="h-64 mt-4 mb-2">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>