<script setup>
import { computed, ref } from 'vue'

// Import child components
import HourlyChart from './HourlyChart.vue'
import FiveDayTable from './FiveDayTable.vue'

// --- Props and Emits Setup ---
// Defines the required 'place' prop which contains all weather data.
const props = defineProps({
  place: {
    type: Object,
    required: true,
  },
})

// Defines the custom event this component can emit to its parent (App.vue).
const emit = defineEmits(['delete-place'])

/**
 * Emits the 'delete-place' event to the parent component.
 */
const deletePlace = () => {
  emit('delete-place', props.place.location.name)
}

// --- State Management ---
// Tracks the currently active view (tab) in the weather card.
const activeView = ref('current')

// --- Computed Properties ---

/**
 * Computes the formatted local time string for the location.
 * Converts the API string format (YYYY-MM-DD HH:mm) into a user-friendly format.
 * @returns {string} Formatted time (e.g., "Fri 02:18 PM").
 */
const formattedLocalTime = computed(() => {
  const localTimeString = props.place.location.localtime
  // Replace space with 'T' to ensure correct date parsing across browsers
  const date = new Date(localTimeString.replace(' ', 'T'))

  return date.toLocaleTimeString('en-us', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
})

/**
 * Computes the dynamic Tailwind CSS class for the background color of the content area.
 * The color changes based on temperature and weather condition (rain/snow).
 * @returns {string} Tailwind CSS class string.
 */
const weatherClass = computed(() => {
  const isDay = props.place.current.is_day
  const temp = props.place.current.temp_f
  const code = props.place.current.condition.code

  // Check condition codes for rain or snow (codes > 1060 usually indicate precipitation)
  const isRainOrSnow = code > 1060

  if (isRainOrSnow) {
    return `bg-slate-700` // Darker/muted color for precipitation
  } else if (temp > 77) {
    const dayBg = `bg-cyan-600`
    const nightBg = `bg-indigo-800`
    return isDay ? dayBg : nightBg // Warmer colors for high temps
  } else {
    const dayBg = `bg-blue-600`
    const nightBg = `bg-indigo-900`
    return isDay ? dayBg : nightBg // Cooler colors for moderate temps
  }
})

/**
 * Computes the CSS style object for the header's background image.
 * The image (clear-day or clear-night) is selected based on the current time (is_day).
 * @returns {Object} CSS style object.
 */
const backgroundStyles = computed(() => {
  const isDay = props.place.current.is_day

  const imagePath = isDay ? '/img/clear-day.png' : '/img/clear-night.png'

  return {
    backgroundImage: `url(${imagePath})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
})

/**
 * Extracts the current date string (YYYY-MM-DD) for use in child components.
 * @returns {string} The date part of the localtime string.
 */
const currentLocationDate = computed(() => {
  return props.place.location.localtime.split(' ')[0]
})
</script>

<template>
  <div
    class="p-4 w-full text-center text-white rounded-xl shadow-2xl transition-all duration-500 max-w-md mx-auto relative overflow-hidden"
  >
    <div
      :style="backgroundStyles"
      class="p-4 rounded-xl **mb-0** bg-blend-multiply relative shadow-inner -mx-4 border-b border-white/50"
    >
      <div class="relative text-shadow">
        <div class="flex justify-between items-start">
          <div class="flex-1 text-center">
            <div v-if="place.location.region !== ''">
              <h2 class="text-xl font-bold">
                {{ place.location.name }}, {{ place.location.region }}, {{ place.location.country }}
              </h2>
            </div>
            <div v-else>
              <h2 class="text-xl font-bold">
                {{ place.location.name }}, {{ place.location.country }}
              </h2>
            </div>

            <p class="text-sm font-semibold mt-1">Updated Time: {{ formattedLocalTime }}</p>
          </div>
          <button @click="deletePlace" class="text-white hover:text-red-300 ml-4">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      <div class="flex justify-center space-x-4 border-t border-white/50 mt-4 pt-4">
        <button
          @click="activeView = 'current'"
          :class="{ 'border-b-2 border-red-400': activeView === 'current' }"
          class="pb-1 text-sm font-semibold text-white"
        >
          Current
        </button>
        <button
          @click="activeView = 'hourly'"
          :class="{ 'border-b-2 border-red-400': activeView === 'hourly' }"
          class="pb-1 text-sm font-semibold text-white"
        >
          Hourly
        </button>
        <button
          @click="activeView = 'fiveDay'"
          :class="{ 'border-b-2 border-red-400': activeView === 'fiveDay' }"
          class="pb-1 text-sm font-semibold text-white"
        >
          5 Day Forecast
        </button>
      </div>
    </div>

    <div :class="weatherClass" class="rounded-xl p-4 -m-4">
      <div v-if="activeView === 'current'">
        <div class="flex flex-col items-center mb-6">
          <img
            :src="place.current.condition.icon"
            :alt="place.current.condition.text"
            class="w-16 h-16"
          />
          <p class="text-5xl font-extrabold">{{ Math.round(place.current.temp_f) }}&deg;F</p>

          <p class="text-xl font-semibold mt-2">{{ place.current.condition.text }}</p>

          <p class="text-sm">
            High: {{ Math.round(place.forecast.forecastday[0].day.maxtemp_f) }}&deg;F / Low:
            {{ Math.round(place.forecast.forecastday[0].day.mintemp_f) }}&deg;F
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 text-sm mb-6">
          <p>Feels Like: {{ Math.round(place.current.feelslike_f) }}&deg;F</p>
          <p>Humidity: {{ place.current.humidity }}%</p>
          <p>Wind: {{ Math.round(place.current.wind_kph) }} kph</p>
          <p>UV Index: {{ Math.round(place.current.uv) }}</p>
        </div>

        <div class="border-t border-red-400/30 pt-4 max-w-xs mx-auto">
          <h3 class="text-lg font-semibold mb-2 text-left">Today's Forecast</h3>
          <div class="mb-2 flex items-center justify-between">
            <div class="text-left">Today</div>
            <div class="w-12 flex justify-center">
              <img :src="place.forecast.forecastday[0].day.condition.icon" alt="icon" width="30" />
            </div>
            <div class="w-24 text-right ink-0">
              <span class="font-bold"
                >{{ Math.round(place.forecast.forecastday[0].day.maxtemp_f) }}&deg;F</span
              >
              /
              <span class="font-bold"
                >{{ Math.round(place.forecast.forecastday[0].day.mintemp_f) }}&deg;F</span
              >
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeView === 'hourly'" class="py-4">
        <HourlyChart :place="place" />
      </div>

      <div v-else-if="activeView === 'fiveDay'" class="py-4">
        <FiveDayTable :forecast="place.forecast.forecastday" :location-date="currentLocationDate" />
      </div>
    </div>
  </div>
</template>
