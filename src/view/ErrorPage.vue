<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
    <div class="text-center max-w-md">
      <!-- Big error code -->
      <h1 class="text-9xl font-extrabold text-red-500">404</h1>

      <!-- Message -->
      <h2 class="mt-4 text-2xl font-bold text-gray-800">Page Not Found</h2>
      <p class="mt-2 text-gray-600">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>

      <!-- Action buttons -->
      <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <router-link
            to="/"
            class="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
        >
          Go Home
        </router-link>
        <router-link
            to="/login"
            class="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
        >
          Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// No logic needed here, purely presentational
</script>
