<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['place-data'])

const searchTerm = reactive({
  query: '',
  timeout: null,
  results: null,
})

const handleSearch = () => {
  clearTimeout(searchTerm.timeout)
  searchTerm.timeout = setTimeout(async () => {
    if (searchTerm.query !== '') {
      const response = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=02820e20d5cb4699bf4163806250112&q=${searchTerm.query}`,
      )
      const data = await response.json()
      searchTerm.results = data
    } else {
      searchTerm.results = null
    }
  }, 500)
}

const getWeather = async (id) => {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=02820e20d5cb4699bf4163806250112&q=id:${id}&days=5&aqi=no&alerts=no`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch weather data for ID: ${id}`)
    }

    const data = await response.json()

    emit('place-data', data)

    searchTerm.query = ''
    searchTerm.results = null
  } catch (error) {
    console.error('Error fetching weather data:', error)
  }
}
</script>

<template>
  <div>
    <form class="w-full">
      <div class="bg-[#bfdbfe] border border-[#093358] rounded-lg shadow-lg flex items-center">
        <i class="fa-solid fa-magnifying-glass p-2 text-[#093358]"></i>
        <input
          type="text"
          placeholder="Add a new location card..."
          class="rounded-r-lg p-2 border-0 outline-0 focus:ring-2 focus:ring-[#F2B705] ring-inset w-full"
          v-model="searchTerm.query"
          @input="handleSearch"
        />
      </div>
    </form>

    <div class="w-full bg-white my-2 rounded-lg shadow-lg">
      <div v-if="searchTerm.results !== null">
        <div v-for="place in searchTerm.results" :key="place.id">
          <button
            @click.stop.prevent="getWeather(place.id)"
            class="px-3 my-2 hover:text-[#093358] hover:font-bold w-full text-left"
          >
            {{ place.name }}, {{ place.region }}, {{ place.country }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
