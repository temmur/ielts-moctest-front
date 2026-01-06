<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <!-- Logo / Title -->
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-indigo-600">IELTS Moctest</h1>
        <span class="text-gray-500 text-sm">by Progress School</span>
        <p class="text-gray-500 text-sm">Sign in to continue</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Username -->
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Login</label>
          <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter your login"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        <!-- Password -->
        <div class="mt-2">
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        <!-- Error -->
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <!-- Submit -->
        <button
            type="submit"
            class="w-full bg-indigo-600 mt-4 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 transition"
        >
          Login
        </button>
      </form>

      <!-- Footer -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const error = ref('')

function handleLogin() {
  if (!username.value || !password.value) {
    error.value = 'Please fill in both fields'
    return
  }

  console.log('Login attempt:', { username: username.value, password: password.value })
  error.value = ''
}
</script>
