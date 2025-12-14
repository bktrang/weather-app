<script setup>
import { reactive } from 'vue'

// Define the custom events this component can emit
const emit = defineEmits(['place-data'])

// --- Reactive State ---
// Uses `reactive` to manage the search input and results state
const searchTerm = reactive({
  query: '', // Holds the current text input by the user
  timeout: null, // Stores the debounce timeout ID
  results: null, // Stores the array of location suggestions from the API
})

// --- Methods ---

/**
 * Handles the search input, implementing a debounce mechanism.
 * It clears the previous timeout and sets a new one, ensuring the API call
 * only fires after the user stops typing for 500ms.
 */
const handleSearch = () => {
  clearTimeout(searchTerm.timeout)
  searchTerm.timeout = setTimeout(async () => {
    if (searchTerm.query !== '') {
      // Fetch location suggestions from the weather API based on the query
      const response = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=02820e20d5cb4699bf4163806250112&q=${searchTerm.query}`,
      )
      const data = await response.json()
      searchTerm.results = data
    } else {
      // Clear results if the search box is empty
      searchTerm.results = null
    }
  }, 500)
}

/**
 * Fetches the 5-day weather forecast for a selected location ID.
 * Emits the weather data to the parent component and resets the search state.
 * @param {number} id - The unique ID of the selected place.
 */
const getWeather = async (id) => {
  try {
    // Fetch the 5-day forecast using the selected location's ID
    const response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=02820e20d5cb4699bf4163806250112&q=id:${id}&days=5&aqi=no&alerts=no`,
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch weather data for ID: ${id}`)
    }

    const data = await response.json()

    // Emit the successful weather data to the parent (App.vue)
    emit('place-data', data)

    // Clear search state after successful selection
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
