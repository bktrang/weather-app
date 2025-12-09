<script setup>
defineProps({
  day: Object,
})

const getDayName = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-us', { weekday: 'long' })
}
</script>

<template>
  <div class="mb-2 flex items-center justify-between">
    <div class="text-left flex-grow">
      {{ getDayName(day.date) }}
    </div>

    <div class="w-12 flex justify-center flex-shrink-0">
      <img :src="day.day.condition.icon" alt="icon" width="30" />
    </div>

    <div class="w-24 text-right flex-shrink-0">
      <span class="font-bold">{{ Math.round(day.day.maxtemp_c) }}&deg;C</span> /
      <span class="opacity-75">{{ Math.round(day.day.mintemp_c) }}&deg;C</span>
    </div>
  </div>
</template>
