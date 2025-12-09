<template>
    <div v-if="!loading">
      <p v-if="error">{{ error }}</p>
      <p v-else-if="city && weatherInfo">
        <i class="fa-solid fa-location-dot text-[#24ceff]"></i> {{ city }}, {{ region }}, {{ country }} <br>
        <span v-if="weatherInfo.icon"><img :src="weatherInfo.icon" width="30" alt="Weather Icon">{{ Math.round(weatherInfo.temperature) }}°C, {{ weatherInfo.condition }}</span>
      </p>
    </div>
</template>
  
<script>
  import { ref, onMounted } from 'vue';
  
  export default {
    setup() {
      const city = ref(null);
      const region = ref(null);
      const country = ref(null);
      const error = ref(null);
      const loading = ref(true);
      const weatherInfo = ref(null);
  
      const getLocationInfo = async (latitude, longitude) => {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1Ijoid2VhdGhlcmx5IiwiYSI6ImNsdHN6aWVodzB1YnYybHJtanRoNHp5cXoifQ.E1vaQJ9EQmbe8gAKfIvpsQ`);
        const data = await response.json();
        if (response.ok) {
          const feature = data.features[0];
          city.value = extractComponent(feature, 'place', 'city');
          region.value = extractComponent(feature, 'region');
          country.value = extractComponent(feature, 'country');
          getWeatherInfo(city.value); // Get weather information for the city
        } else {
          error.value = data.message || 'Failed to retrieve location.';
        }
        loading.value = false;
      };
  
      const extractComponent = (feature, type, component) => {
        const context = feature.context.find(c => c.id.startsWith(type));
        return context ? context.text : null;
      };
  
      const getWeatherInfo = async (city) => {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=b5d8dc347ec54185977173721240403&q=${city}&aqi=no`);
        const data = await response.json();
        if (response.ok) {
          const temperature = data.current.temp_c;
          const condition = data.current.condition.text;
          const iconUrl = data.current.condition.icon;
          weatherInfo.value = { temperature, condition, icon: iconUrl };
        } else {
          error.value = data.error.message || 'Failed to retrieve weather information.';
        }
      };
  
      const getLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            getLocationInfo(latitude, longitude);
          },
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              city.value = null;
              region.value = null;
              country.value = null;
              error.value = null;
            } else {
              error.value = err.message || 'Failed to retrieve location.';
            }
            loading.value = false;
          }
        );
      };
  
      // Automatically get location when component is mounted
      onMounted(getLocation);
  
      return { city, region, country, error, loading, weatherInfo };
    }
  };
</script>
  