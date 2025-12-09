<script setup>
import { ref, onMounted, watch } from 'vue'
import SearchInput from './components/searchBar.vue'
import WeatherCard from './components/WeatherCard.vue'

const savedPlaces = ref([])
const currentPlace = ref(null)
const selectedPlaceName = ref(null)

const API_KEY = '02820e20d5cb4699bf4163806250112'

// --- Local Storage Hooks ---

onMounted(() => {
  if (localStorage.getItem('savedPlaces')) {
    savedPlaces.value = JSON.parse(localStorage.getItem('savedPlaces'))

    // Load the first saved place on application startup with validation
    if (savedPlaces.value.length > 0 && savedPlaces.value[0] && savedPlaces.value[0].location) {
      fetchPlace(savedPlaces.value[0].location.name)
    } else {
      savedPlaces.value = []
    }
  }
})

watch(
  savedPlaces,
  (newSavedPlaces) => {
    localStorage.setItem('savedPlaces', JSON.stringify(newSavedPlaces))
  },
  { deep: true },
)

// --- Core Functions ---

const fetchPlace = async (locationIdentifier) => {
  const query = locationIdentifier

  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=5&aqi=no&alerts=no`,
    )
    const data = await res.json()

    if (data.error) {
      throw new Error(data.error.message || `API Error for ${locationIdentifier}`)
    }

    currentPlace.value = data
    selectedPlaceName.value = data.location.name
  } catch (error) {
    console.error('Error fetching weather data:', error)
    currentPlace.value = null
    selectedPlaceName.value = null
  }
}

// Receives full data object from searchBar.vue and updates the view
const addPlace = (data) => {
  if (!data || !data.location || !data.location.name) {
    console.error('Invalid weather data received:', data)
    return
  }

  const newLocationName = data.location.name

  // 1. Check if place is already in the saved list before pushing
  if (!savedPlaces.value.some((p) => p.location.name === newLocationName)) {
    savedPlaces.value.push(data)
  }

  // 2. Set the current view to the newly searched/added place
  currentPlace.value = data
  selectedPlaceName.value = newLocationName
}

const viewPlace = (locationName) => {
  fetchPlace(locationName)
}

const deleteSavedPlace = (name) => {
  if (confirm(`Are you sure you want to remove ${name} from the saved list?`)) {
    savedPlaces.value = savedPlaces.value.filter((p) => p.location.name !== name)

    if (currentPlace.value && currentPlace.value.location.name === name) {
      currentPlace.value = null
      selectedPlaceName.value = null

      if (savedPlaces.value.length > 0 && savedPlaces.value[0] && savedPlaces.value[0].location) {
        viewPlace(savedPlaces.value[0].location.name)
      }
    }
  }
}

const handleDropdownChange = (event) => {
  const selectedName = event.target.value
  if (selectedName) {
    viewPlace(selectedName)
  }
}

const deletePlace = (name) => {
  deleteSavedPlace(name)
}
</script>

<template>
  <main>
    <div class="text-center mb-6">
      {{
        new Date().toLocaleDateString('en-us', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }}
    </div>

    <div>
      <SearchInput @place-data="addPlace" />
    </div>

    <hr class="my-4" />

    <div class="mb-6 flex items-end gap-4">
      <div class="flex-1">
        <label for="saved-places" class="block text-sm font-medium text-gray-700">
          View Saved Locations
        </label>
        <select
          id="saved-places"
          :value="selectedPlaceName"
          @change="handleDropdownChange"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option :value="null" disabled>-- Select a City --</option>
          <option
            v-for="place in savedPlaces"
            :key="place.location.name"
            :value="place.location.name"
          >
            {{ place.location.name }}
          </option>
        </select>
      </div>

      <button
        v-if="selectedPlaceName"
        @click="deleteSavedPlace(selectedPlaceName)"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <i class="fa-solid fa-trash mr-2"></i> Delete {{ selectedPlaceName }}
      </button>
    </div>

    <hr class="my-4" />

    <div v-if="currentPlace" class="flex justify-center">
      <WeatherCard :place="currentPlace" @delete-place="deletePlace" />
    </div>
    <div v-else class="text-center py-10 text-gray-500">
      <p>Search for a city or select a saved location to view the weather.</p>
    </div>
  </main>
</template>
