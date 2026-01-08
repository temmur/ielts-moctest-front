<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {useAuth} from "@/composables/useAuth";
const { logout } = useAuth()
import { supabase } from '@/lib/supabase'
import AddTestModal from "@/components/modals/AddTestModal.vue";

const loading = ref(true)
const showAddTestModal = ref(false)

// Students and tests
const students = ref<any[]>([])
const listeningTests = ref<any[]>([])
const readingTests = ref<any[]>([])
const writingTests = ref<any[]>([])

// Load students with results
const loadStudents = async () => {
  const { data } = await supabase
      .from('profiles')
      .select(`
      id,
      full_name,
      role,
      student_tests (
        id,
        listening_score,
        reading_score,
        writing_score,
        speaking_score,
        overall_band
      )
    `)
      .eq('role', 'student')

  students.value = data || []
}

// Load all tests
const loadTests = async () => {
  const { data: lData } = await supabase
      .from('listening_tests')
      .select('*')
      .order('created_at', { ascending: false })
  listeningTests.value = lData || []

  const { data: rData } = await supabase
      .from('reading_tests')
      .select('*')
      .order('created_at', { ascending: false })
  readingTests.value = rData || []

  const { data: wData } = await supabase
      .from('writing_tests')
      .select('*')
      .order('created_at', { ascending: false })
  writingTests.value = wData || []
}

// Delete student results
const clearResults = async (studentTestId: string) => {
  if (!confirm('Delete all results for this student?')) return

  await supabase
      .from('student_tests')
      .delete()
      .eq('id', studentTestId)

  loadStudents()
}

// Delete test
const deleteTest = async (type: string, testId: string) => {
  if (!confirm('Delete test permanently?')) return

  await supabase
      .from(type + '_tests')
      .delete()
      .eq('id', testId)

  loadTests()
}

onMounted(async () => {
  await loadStudents()
  await loadTests()
  loading.value = false
})

// Reload after adding test
const handleTestAdded = () => {
  showAddTestModal.value = false
  loadTests()
}
</script>
<template>
  <div class="min-h-screen bg-gray-50 px-8 py-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Teacher Panel</h1>

      <!-- Students Results -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">Students Results</h2>

        <div class="overflow-x-auto border rounded-lg bg-white">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-left">Student</th>
              <th class="p-3">Listening</th>
              <th class="p-3">Reading</th>
              <th class="p-3">Writing</th>
              <th class="p-3">Speaking</th>
              <th class="p-3">Overall</th>
              <th class="p-3"></th>
            </tr>
            </thead>

            <tbody>
            <tr
                v-for="student in students"
                :key="student.id"
                class="border-t"
            >
              <td class="p-3 font-medium">{{ student.full_name }}</td>
              <td class="p-3 text-center">{{ student.student_tests?.listening_score ?? '-' }}</td>
              <td class="p-3 text-center">{{ student.student_tests?.reading_score ?? '-' }}</td>
              <td class="p-3 text-center">{{ student.student_tests?.writing_score ?? '-' }}</td>
              <td class="p-3 text-center">{{ student.student_tests?.speaking_score ?? '-' }}</td>
              <td class="p-3 text-center font-semibold">{{ student.student_tests?.overall_band ?? '-' }}</td>
              <td class="p-3 text-right">
                <button
                    @click="clearResults(student.student_tests?.id)"
                    class="text-red-600 hover:underline"
                >Clear</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Tests Management -->
      <section>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-semibold">Tests Management</h2>
          <button
              @click="showAddTestModal = true"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
          >
            + Add Test
          </button>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="test in listeningTests" :key="test.id" class="bg-white p-4 rounded shadow">
            <h3 class="font-medium">{{ test.title }}</h3>
            <p class="text-sm text-gray-500">Listening</p>
            <div class="flex gap-2 mt-2">
              <button class="text-indigo-600 hover:underline">Edit</button>
              <button @click="deleteTest('listening', test.id)" class="text-red-600 hover:underline">Delete</button>
            </div>
          </div>

          <div v-for="test in readingTests" :key="test.id" class="bg-white p-4 rounded shadow">
            <h3 class="font-medium">{{ test.title }}</h3>
            <p class="text-sm text-gray-500">Reading</p>
            <div class="flex gap-2 mt-2">
              <button class="text-indigo-600 hover:underline">Edit</button>
              <button @click="deleteTest('reading', test.id)" class="text-red-600 hover:underline">Delete</button>
            </div>
          </div>

          <div v-for="test in writingTests" :key="test.id" class="bg-white p-4 rounded shadow">
            <h3 class="font-medium">{{ test.title }}</h3>
            <p class="text-sm text-gray-500">Writing</p>
            <div class="flex gap-2 mt-2">
              <button class="text-indigo-600 hover:underline">Edit</button>
              <button @click="deleteTest('writing', test.id)" class="text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Add Test Modal -->
    <AddTestModal
        v-if="showAddTestModal"
        @close="showAddTestModal = false"
        @test-added="handleTestAdded"
    />
    <button @click="logout">Logout</button>
  </div>
</template>
