<script setup>
import { defineProps } from 'vue'

defineProps({
  forecast: {
    type: Array,
    required: true,
  },
})

const getDayName = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-us', { weekday: 'long' })
}
</script>

<template>
  <div class="mt-4 text-sm">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b border-white/30">
          <th class="py-2 pr-2 font-bold">Day</th>
          <th class="py-2 pr-2 font-bold text-center">Conditions</th>
          <th class="py-2 font-bold text-right">High / Low</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="day in forecast"
          :key="day.date"
          class="border-b border-white/10 last:border-b-0 hover:bg-white/10 transition-colors duration-150"
        >
          <td class="py-2 font-semibold">
            {{ getDayName(day.date) }}
          </td>
          <td class="py-2 pr-2 flex items-center justify-center">
            <img :src="day.day.condition.icon" :alt="day.day.condition.text" class="w-8 h-8 mr-2" />
            {{ day.day.condition.text }}
          </td>
          <td class="py-2 text-right">
            <span class="font-bold">{{ Math.round(day.day.maxtemp_c) }}&deg;C</span> /
            <span class="opacity-75">{{ Math.round(day.day.mintemp_c) }}&deg;C</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
