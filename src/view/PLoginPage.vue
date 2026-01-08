<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import { useAuth } from '@/composables/useAuth'

const { logout } = useAuth()

const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const login = async () => {
  errorMessage.value = ''
  loading.value = true

  console.log('Trying login...')

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  console.log('Auth response:', data, error)

  loading.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  router.push('/')
}

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
    <div
        class="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
    >
      <h1 class="text-2xl font-semibold text-white mb-2">
        <button @click="logout">Logout</button>
        Welcome back
      </h1>
      <p class="text-sm text-slate-400 mb-6">
        Login to continue to the platform
      </p>

      <div class="space-y-4">
        <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full px-4 py-3 mb-4 rounded-xl bg-slate-800/60 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="w-full px-4 py-3 rounded-xl bg-slate-800/60 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
          @click="login"
          @keyup.enter="login"
          :disabled="loading"
          class="mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition text-white font-medium disabled:opacity-50"
      >
        <span v-if="!loading">Login</span>
        <span v-else>Signing in...</span>
      </button>

      <p v-if="errorMessage" class="mt-4 text-red-400 text-sm">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>
