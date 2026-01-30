<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import { useAuth } from '@/composables/useAuth'
import { Icon } from '@iconify/vue'

const { logout } = useAuth()
const router = useRouter()

const showPassword = ref(false)
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const login = async () => {
  errorMessage.value = ''
  loading.value = true

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    loading.value = false
    errorMessage.value = error.message
    return
  }

  const userId = data.user.id

  const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

  loading.value = false

  if (profileError) {
    errorMessage.value = profileError.message
    return
  }

  if (profile.role === 'teacher') {
    router.push('/teacher-panel')
  } else {
    router.push('test/listening')
  }
}
</script>

<template>
  <div
      class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-cover bg-center"
      :style="{ backgroundImage: 'url(https://images.pexels.com/photos/7130476/pexels-photo-7130476.jpeg)' }"
  >




  <!-- Optional subtle background pattern -->
    <div class="absolute inset-0 bg-[url('@/assets/bg-texture.png')] bg-center bg-cover opacity-10"></div>

    <!-- Login container -->
    <div
        class="relative w-full max-w-md bg-white/5 backdrop-blur-[25px] bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 rounded-3xl p-10 shadow-2xl"
    >
      <!-- Logo -->
      <div class="flex justify-center">
        <img src="@/assets/logo/ps.jpg" alt="Progress International School" class="w-30 h-30 rounded-full shadow-lg"/>
      </div>

      <!-- Tagline -->
      <p class="text-center text-slate-500 text-sm mb-7">Your journey to progress starts here</p>

      <!-- Title -->
      <h1 class="text-2xl font-semibold text-white text-center">Welcome back</h1>
      <p class="text-center text-slate-600 text-sm mb-6">
        Login to continue to the platform
      </p>

      <!-- Input Fields -->
      <div class="space-y-4 relative">
        <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full px-5 py-3 rounded-2xl bg-slate-800/70 text-white placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-indigo-400 transition"
        />

        <div class="relative">
          <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              autocomplete="off"
              class="w-full px-5 py-3 mt-2 rounded-2xl bg-slate-800/70 text-white placeholder-slate-400 outline-none shadow-inner focus:ring-4 focus:ring-indigo-400 transition"
          />
          <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 mt-1  top-1/2 -translate-y-1/2 text-black transition"
          >
            <Icon :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'" width="22" height="22"/>
          </button>
        </div>
      </div>

      <!-- Login Button -->
      <button
          @click="login"
          @keyup.enter="login"
          :disabled="loading"
          class="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-semibold shadow-lg disabled:opacity-50"
      >
        <span v-if="!loading">Login</span>
        <span v-else>Signing in...</span>
      </button>

      <!-- Error Message -->
      <p v-if="errorMessage" class="mt-4 text-red-400 text-sm text-center">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>
