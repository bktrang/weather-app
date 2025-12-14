// tailwind.config.js

export default {
  content: [
    'index.html',
    // ⭐ CORRECTED SYNTAX: No spaces
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        // Clear Day: Bright Blue
        'clear-day-img': "url('/public/img/clear-day.png')",

        // Clear Night: Deep Indigo
        'clear-night-img': "url('/public/img/clear-night.png')",

        // Clear Day: Bright Blue
        'clear-day': 'linear-gradient(to bottom right, #3B82F6, #93C5FD)',

        // Clear Night: Deep Indigo
        'clear-night': 'linear-gradient(to bottom right, #3730A3, #5B21B6)',

        // Rain/Snow: Dark Slate/Gray
        'rainy-day': 'linear-gradient(to bottom right, #475569, #64748B)',

        // Warm Day: Warm Cyan/Teal
        'warm-day': 'linear-gradient(to bottom right, #06B6D4, #22D3EE)',

        // Warm Night: Deep Blue/Purple
        'warm-night': 'linear-gradient(to bottom right, #4F46E5, #6366F1)',
      },
    },
  },
  plugins: [],
}
