<script setup>
import { defineProps, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
} from 'chart.js'

// Register all necessary Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
)

const props = defineProps({
  place: {
    type: Object,
    required: true,
  },
})

// Extract and structure data for the chart
const chartData = computed(() => {
  const hourlyData = props.place.forecast.forecastday[0].hour

  // Labels (Time)
  const labels = hourlyData.map((hour) => {
    // Format the hour from "YYYY-MM-DD HH:MM" to "HH:MM"
    return new Date(hour.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  })

  // Temperatures (Line Chart)
  const temps = hourlyData.map((hour) => hour.temp_c)

  // Rain Amounts (Bar Chart) - Using 'mm' for precipitation
  const rain = hourlyData.map((hour) => hour.precip_mm)

  return {
    labels: labels,
    datasets: [
      {
        type: 'line', // Line for Temperature
        label: 'Temperature (°C)',
        data: temps,
        borderColor: '#3B82F6', // Blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // Light Blue fill
        fill: true,
        yAxisID: 'yTemp',
        tension: 0.4,
      },
      {
        type: 'bar', // Bar for Rain
        label: 'Rain Amount (mm)',
        data: rain,
        backgroundColor: '#475569', // Slate-600
        yAxisID: 'yRain',
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'white',
      },
    },
    title: {
      display: true,
      text: 'Hourly Conditions',
      color: 'white',
    },
  },
  scales: {
    x: {
      ticks: { color: 'white' },
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
    },
    yTemp: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Temp (°C)',
        color: '#3B82F6',
      },
      ticks: { color: 'white' },
      grid: { color: 'rgba(255, 255, 255, 0.2)' },
    },
    yRain: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'Rain (mm)',
        color: '#475569',
      },
      ticks: { color: 'white' },
      grid: { drawOnChartArea: false }, // Don't draw gridlines over chart area
    },
  },
}
</script>

<template>
  <div class="h-64 mt-4 mb-2">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
