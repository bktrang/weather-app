<script setup>
import { defineProps } from 'vue'

// --- Props Setup ---
const props = defineProps({
  // Array containing the 5-day forecast data from the API
  forecast: {
    type: Array,
    required: true,
  },
  // The current date of the displayed location, used to identify 'Today'
  locationDate: {
    type: String,
    required: true,
  },
})

// --- Utility Function ---

/**
 * Converts a date string (YYYY-MM-DD) into a weekday name.
 * Replaces the current date with the label "Today".
 * @param {string} dateString - The date string from the forecast data.
 * @returns {string} The day name (e.g., "Today", "Monday", "Tuesday").
 */
const getDayName = (dateString) => {
  // Append 'T00:00:00' to ensure correct date parsing across all environments
  const date = new Date(dateString + 'T00:00:00')

  // Check if the forecast date matches the current location date
  if (dateString === props.locationDate) {
    return 'Today'
  }

  // Return the full weekday name for future days
  return date.toLocaleDateString('en-us', { weekday: 'long' })
}
</script>

<template>
  <div class="mt-4 text-sm">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b border-red-400/30">
          <th class="py-2 pr-2 font-bold">Day</th>
          <th class="py-2 pr-2 font-bold text-center">Conditions</th>
          <th class="py-2 font-bold text-right">High / Low</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="day in forecast"
          :key="day.date"
          class="border-b border-red-400/10 last:border-b-0 hover:bg-white/10 transition-colors duration-150"
        >
          <td class="py-2 font-semibold">
            {{ getDayName(day.date) }}
          </td>
          <td class="py-2 pr-2 flex items-center justify-center">
            <img :src="day.day.condition.icon" :alt="day.day.condition.text" class="w-8 h-8 mr-2" />
            {{ day.day.condition.text }}
          </td>
          <td class="py-2 text-right">
            <span class="font-bold">{{ Math.round(day.day.maxtemp_f) }}&deg;F</span> /
            <span class="font-bold">{{ Math.round(day.day.mintemp_f) }}&deg;F</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
