<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

/* =========================
   ROUTER + TIMER
========================= */
const router = useRouter()
const timeLeft = ref(300) // 3 minutes for testing
let timer: number | null = null

const startTimer = () => {
  timer = window.setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--
    else finishWriting()
  }, 1000)
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/* =========================
   TASKS
========================= */
const currentTaskIndex = ref(0)
const writingAnswers = ref<Record<number, string>>({})

const tasks = ref([
  {
    id: 1,
    type: 'task1',
    title: 'Task 1: Map Analysis',
    instructions: 'Describe the map below in your own words.',
    // Replace with actual image or chart URL
    image: 'https://avatars.mds.yandex.net/i?id=941dc193ef76c88dbc325612a9e5688e174a4dbc-4389215-images-thumbs&n=13'
  },
  {
    id: 2,
    type: 'task2',
    title: 'Task 2: Essay',
    instructions: 'Write an essay responding to the following question.',
    text: 'Some people believe that technology improves education. To what extent do you agree or disagree?'
  }
])

/* =========================
   NAVIGATION
========================= */
const nextTask = () => {
  if (currentTaskIndex.value < tasks.value.length - 1) {
    currentTaskIndex.value++
  }
}

const finishWriting = () => {
  if (timer) clearInterval(timer)

  // Store answers
  localStorage.setItem('writingAnswers', JSON.stringify(writingAnswers.value))

  alert('Writing finished! Your answers are saved.')
  // Redirect to results page or next step
  router.push('/login')
}

onMounted(startTimer)
onBeforeUnmount(() => timer && clearInterval(timer))
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">

    <!-- HEADER -->
    <div class="border-b px-6 py-4 flex justify-between">
      <h1 class="text-xl font-bold">
        <span class="text-red-600 text-3xl mr-2">IELTS</span>
        Writing
      </h1>
      <div class="font-mono text-red-600 text-lg">
        ⏱ {{ formatTime(timeLeft) }}
      </div>
    </div>

    <!-- TASK CONTENT -->
    <div class="flex flex-1 overflow-hidden">

      <!-- LEFT SIDE -->
      <div class="w-1/2 border-r px-6 py-4 overflow-y-auto">
        <h2 class="font-semibold text-lg mb-4">
          {{ tasks[currentTaskIndex].title }}
        </h2>
        <p class="mb-4">{{ tasks[currentTaskIndex].instructions }}</p>

        <!-- Image for Task 1 -->
        <img
            v-if="tasks[currentTaskIndex].type === 'task1'"
            :src="tasks[currentTaskIndex].image"
            alt="Task 1 image"
            class="w-full border rounded mb-4"
        />

        <!-- Text for Task 2 -->
        <p v-if="tasks[currentTaskIndex].type === 'task2'" class="text-gray-800 whitespace-pre-line">
          {{ tasks[currentTaskIndex].text }}
        </p>
      </div>

      <!-- RIGHT SIDE -->
      <div class="w-1/2 px-6 py-4 overflow-y-auto">
        <h3 class="font-semibold text-lg mb-4">Your Response</h3>

        <textarea
            v-model="writingAnswers[tasks[currentTaskIndex].id]"
            placeholder="Write your answer here..."
            class="w-full h-[400px] border rounded p-2 resize-none"
        ></textarea>
      </div>

    </div>

    <!-- FOOTER NAV -->
    <div class="border-t px-6 py-4 text-center">
      <button
          v-if="currentTaskIndex < tasks.length - 1"
          @click="nextTask"
          class="px-8 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-500"
      >
        Next Task
      </button>

      <button
          v-else
          @click="finishWriting"
          class="px-8 py-3 bg-green-600 text-white rounded hover:bg-green-500"
      >
        Finish Writing
      </button>
    </div>

  </div>
</template>
