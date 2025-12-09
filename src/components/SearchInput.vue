<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['place-data'])

const API_KEY = '02820e20d5cb4699bf4163806250112'

const searchTerm = reactive({
  query: '',
  timeout: null,
  results: null,
})

const handleSearch = () => {
  clearTimeout(searchTerm.timeout)
  searchTerm.timeout = setTimeout(async () => {
    if (searchTerm.query !== '') {
      const res = await fetch(
        `http://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${searchTerm.query}`,
      )
      const data = await res.json()
      searchTerm.results = data
    } else {
      searchTerm.results = null
    }
  }, 500)
}

const getWeather = async (id) => {
  try {
    // 1. Fetch the full weather data using the ID
    const res = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=id:${id}&days=5&aqi=no&alerts=no`,
    )

    if (!res.ok) {
      throw new Error(`Failed to fetch weather data for ID: ${id}`)
    }

    const data = await res.json()

    // 2. Emit the full data object back to App.vue's addPlace
    emit('place-data', data)

    // 3. Clear the search state immediately after emission.
    searchTerm.query = ''
    searchTerm.results = null
  } catch (error) {
    console.error('Error fetching final weather data:', error)
  }
}
</script>

<template>
  <div>
    <div class="bg-white border border-indigo-600/30 rounded-lg shadow-lg flex items-center">
      <i class="fa-solid fa-magnifying-glass p-2 text-indigo-600"></i>
      <input
        type="text"
        placeholder="Search for a place"
        class="rounded-r-lg p-2 border-0 outline-0 focus:ring-2 focus:ring-indigo-600 ring-inset w-full"
        v-model="searchTerm.query"
        @input="handleSearch"
        @keyup.enter="handleSearch"
      />
    </div>
    <div class="bg-white my-2 rounded-lg shadow-lg">
      <div v-if="searchTerm.results !== null">
        <div v-for="place in searchTerm.results" :key="place.id">
          <div
            @click="getWeather(place.id)"
            class="px-3 py-2 hover:text-indigo-600 hover:font-bold w-full text-left cursor-pointer"
          >
            {{ place.name }}, {{ place.region }}, {{ place.country }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
