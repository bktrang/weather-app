<script setup>
import { defineProps, defineEmits, computed, ref } from 'vue' // ⭐ Added 'ref'
import WeatherForecastDay from './WeatherForecastDay.vue'

// ⭐ NEW IMPORTS for the views
// ASSUMES you have created these files as per the previous response
import HourlyChart from './HourlyChart.vue'
import FiveDayTable from './FiveDayTable.vue'

const props = defineProps({
  place: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['delete-place'])

const deletePlace = () => {
  emit('delete-place', props.place.location.name)
}

// ⭐ NEW STATE: Tracks the active view within the card (default: 'current')
const activeView = ref('current')

// ⭐ DYNAMIC CLASS LOGIC: PRESERVED and UNTOUCHED ⭐
const weatherClass = computed(() => {
  const isDay = props.place.current.is_day
  const temp = props.place.current.temp_c
  const code = props.place.current.condition.code

  // Condition codes above 1060 generally include snow, rain, sleet, etc.
  const isRainOrSnow = code > 1060

  if (isRainOrSnow) {
    // Dark Slate Blue for rain/snow
    return 'bg-slate-700 shadow-slate-900'
  } else if (temp > 25) {
    // Warm/Hot conditions (Orange/Cyan)
    return isDay ? 'bg-cyan-600 shadow-cyan-900' : 'bg-indigo-800 shadow-indigo-900'
  } else {
    // Default clear/mild conditions (Blue/Deep Indigo)
    return isDay ? 'bg-blue-600 shadow-blue-900' : 'bg-indigo-900 shadow-indigo-950'
  }
})
</script>

<template>
  <div
    :class="weatherClass"
    class="p-4 w-full text-center text-white rounded-xl shadow-2xl transition-all duration-500 max-w-md mx-auto relative overflow-hidden"
  >
    <div class="relative text-shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">{{ place.location.name }}</h2>
        <button @click="deletePlace" class="text-white hover:text-red-300">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>

      <div class="flex justify-center space-x-4 border-b border-white/30 mb-4 pb-2">
        <button
          @click="activeView = 'current'"
          :class="{ 'border-b-2 border-white': activeView === 'current' }"
          class="pb-1 text-sm font-semibold"
        >
          Current
        </button>
        <button
          @click="activeView = 'hourly'"
          :class="{ 'border-b-2 border-white': activeView === 'hourly' }"
          class="pb-1 text-sm font-semibold"
        >
          Hourly
        </button>
        <button
          @click="activeView = 'fiveDay'"
          :class="{ 'border-b-2 border-white': activeView === 'fiveDay' }"
          class="pb-1 text-sm font-semibold"
        >
          5 Day Forecast
        </button>
      </div>
      <div v-if="activeView === 'current'">
        <div class="flex flex-col items-center mb-6">
          <img
            :src="place.current.condition.icon"
            :alt="place.current.condition.text"
            class="w-16 h-16"
          />
          <p class="text-5xl font-extrabold">{{ place.current.temp_c }}&deg;C</p>

          <p class="text-xl font-semibold mt-2">{{ place.current.condition.text }}</p>

          <p class="text-sm">
            High: **{{ place.forecast.forecastday[0].day.maxtemp_c }}&deg;C** / Low:
            {{ place.forecast.forecastday[0].day.mintemp_c }}&deg;C
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 text-sm mb-6">
          <p>Feels Like: {{ place.current.feelslike_c }}&deg;C</p>
          <p>Humidity: {{ place.current.humidity }}%</p>
          <p>Wind: {{ place.current.wind_kph }} kph</p>
          <p>UV Index: {{ place.current.uv }}</p>
        </div>

        <div class="border-t border-white/30 pt-4 max-w-xs mx-auto">
          <h3 class="text-lg font-semibold mb-2 text-left">Today's Forecast</h3>
          <div class="mb-2 flex items-center justify-between">
            <div class="text-left flex-grow">Today</div>
            <div class="w-12 flex justify-center flex-shrink-0">
              <img :src="place.forecast.forecastday[0].day.condition.icon" alt="icon" width="30" />
            </div>
            <div class="w-24 text-right flex-shrink-0">
              <span class="font-bold"
                >{{ Math.round(place.forecast.forecastday[0].day.maxtemp_c) }}&deg;C</span
              >
              /
              <span class="opacity-75"
                >{{ Math.round(place.forecast.forecastday[0].day.mintemp_c) }}&deg;C</span
              >
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeView === 'hourly'" class="py-4">
        <HourlyChart :place="place" />
      </div>

      <div v-else-if="activeView === 'fiveDay'" class="py-4">
        <FiveDayTable :forecast="place.forecast.forecastday" />
      </div>
    </div>
  </div>
</template>
