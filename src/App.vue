<script setup>
import { ref, onMounted, watch } from 'vue'
import SearchInput from './components/searchBar.vue'
import WeatherCard from './components/WeatherCard.vue'

// --- State Management ---
// Array to store the weather data for all user-saved locations.
const savedPlaces = ref([])
// Object to store the weather data for the currently displayed location.
const currentPlace = ref(null)
// Stores the unique key (City-Region-Country) of the currently selected/viewed place.
const selectedPlaceKey = ref(null)

// WeatherAPI API Key
const API_KEY = '02820e20d5cb4699bf4163806250112'

/**
 * Creates a URL-safe, unique key for a location based on its full name.
 * Used for reliable storage keys and comparison.
 * @param {Object} location - The location object from the weather data.
 * @returns {string} The unique key (e.g., "portland-oregon-united-states").
 */
const createLocationKey = (location) => {
  // Note: We include region in the key to ensure uniqueness even if it's empty
  return `${location.name}-${location.region}-${location.country}`
    .toLowerCase()
    .replace(/\s+/g, '-')
}

// --- Lifecycle Hook: onMounted ---
// Loads saved places from localStorage upon component mounting.
// Automatically fetches weather data for the first saved place, if any exist.
onMounted(() => {
  if (localStorage.getItem('savedPlaces')) {
    savedPlaces.value = JSON.parse(localStorage.getItem('savedPlaces'))

    if (savedPlaces.value.length > 0) {
      const firstPlace = savedPlaces.value[0]
      const firstKey = createLocationKey(firstPlace.location)
      fetchPlace(firstKey)
    } else {
      savedPlaces.value = []
    }
  }
})

// --- Watcher Hook ---
// Watches for changes in the 'savedPlaces' array and updates localStorage deeply.
watch(
  savedPlaces,
  (newSavedPlaces) => {
    localStorage.setItem('savedPlaces', JSON.stringify(newSavedPlaces))
  },
  { deep: true },
)

// --- Core API Functions ---

/**
 * Fetches current and forecast weather data for a specified location identifier.
 * Updates 'currentPlace' and 'selectedPlaceKey' on success.
 * @param {string} locationIdentifier - The unique location key used as the API query.
 */
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
    // Update the selected key based on the location data returned by the API
    selectedPlaceKey.value = createLocationKey(data.location)
  } catch (error) {
    console.error('Error fetching weather data:', error)
    currentPlace.value = null
    selectedPlaceKey.value = null
  }
}

/**
 * Handles weather data received from the SearchInput component.
 * Adds the place to the saved list (if new) and sets it as the current view.
 * @param {Object} data - The full weather data object for the new place.
 */
const addPlace = (data) => {
  if (!data || !data.location) {
    console.error('Invalid weather data received:', data)
    return
  }

  const newLocationKey = createLocationKey(data.location)

  // Only add the place to the saved list if it doesn't already exist
  if (!savedPlaces.value.some((p) => createLocationKey(p.location) === newLocationKey)) {
    savedPlaces.value.push(data)
  }

  // Set the view to the newly searched/added place
  currentPlace.value = data
  selectedPlaceKey.value = newLocationKey
}

/**
 * Views a saved place by triggering a fresh API fetch.
 * @param {string} uniqueKey - The unique key of the place to view.
 */
const viewPlace = (uniqueKey) => {
  // Find the full place data to construct a reliable location string for the API
  const placeToView = savedPlaces.value.find((p) => createLocationKey(p.location) === uniqueKey)

  // Use the full descriptive name (City, Region, Country) as the API query
  // Note: API accepts empty region string
  const fullLocationIdentifier = `${placeToView.location.name}, ${placeToView.location.region}, ${placeToView.location.country}`

  fetchPlace(fullLocationIdentifier)
}

/**
 * Deletes a saved place from the list and handles view switching.
 * @param {string} key - The unique key of the place to delete.
 */
const deleteSavedPlace = (key) => {
  const placeToDelete = savedPlaces.value.find((p) => createLocationKey(p.location) === key)
  const name = placeToDelete ? placeToDelete.location.name : 'this place'

  if (confirm(`Are you sure you want to remove ${name} from the saved list?`)) {
    // Filter out the place based on the unique key
    savedPlaces.value = savedPlaces.value.filter((p) => createLocationKey(p.location) !== key)

    // If the deleted place was the current view, reset the view
    if (selectedPlaceKey.value === key) {
      currentPlace.value = null
      selectedPlaceKey.value = null

      // Attempt to view the first place in the new saved list
      if (savedPlaces.value.length > 0) {
        const nextPlaceKey = createLocationKey(savedPlaces.value[0].location)
        viewPlace(nextPlaceKey)
      }
    }
  }
}

/**
 * Handles the change event from the saved locations dropdown.
 * @param {Event} event - The native change event.
 */
const handleDropdownChange = (event) => {
  const selectedKey = event.target.value
  if (selectedKey) {
    viewPlace(selectedKey)
  }
}

/**
 * Utility function to trigger deletion of the currently selected place.
 * Used for the delete button attached to the WeatherCard (if needed) or the main UI delete button.
 */
const deletePlace = () => {
  if (selectedPlaceKey.value) {
    deleteSavedPlace(selectedPlaceKey.value)
  }
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
          :value="selectedPlaceKey"
          @change="handleDropdownChange"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option :value="null" disabled>-- Select a City --</option>
          <option
            v-for="place in savedPlaces"
            :key="createLocationKey(place.location)"
            :value="createLocationKey(place.location)"
          >
            {{ 
                place.location.name 
                + (place.location.region ? `, ${place.location.region}` : '') 
                + `, ${place.location.country}` 
            }}
          </option>
        </select>
      </div>

      <button
        v-if="selectedPlaceKey"
        @click="deleteSavedPlace(selectedPlaceKey)"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <i class="fa-solid fa-trash mr-2"></i> Delete
        {{ currentPlace ? currentPlace.location.name : 'Location' }}
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