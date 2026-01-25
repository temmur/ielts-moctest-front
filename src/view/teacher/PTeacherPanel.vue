<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import AddTestModal from "@/components/modals/AddTestModal.vue"
import UpdateTestModal from "@/components/UpdateTestModal.vue"
import CButton from "@/components/forms/CButton.vue"

/* ================= STATE ================= */
const loading = ref(true)

const showAddModal = ref(false)
const showEditModal = ref(false)

const editingTest = ref<any>(null)
const editingTestType = ref<'listening' | 'reading' | 'writing' | ''>('')

const listeningTests = ref<any[]>([])
const readingTests = ref<any[]>([])
const writingTests = ref<any[]>([])

/* ================= LOAD TESTS ================= */
const loadTests = async () => {
  const { data: l } = await supabase.from('listening_tests').select('*').order('created_at', { ascending: false })
  const { data: r } = await supabase.from('reading_tests').select('*').order('created_at', { ascending: false })
  const { data: w } = await supabase.from('writing_tests').select('*').order('created_at', { ascending: false })

  listeningTests.value = l || []
  readingTests.value = r || []
  writingTests.value = w || []
}

/* ================= OPEN ADD ================= */
const openAddTestModal = () => {
  showAddModal.value = true
}

/* ================= OPEN EDIT ================= */
const openEditModal = async (test: any, type: 'listening' | 'reading' | 'writing') => {
  editingTestType.value = type

  try {
    const testWithDetails: any = { ...test }

    if (type === 'listening') {
      const { data: sections } = await supabase
          .from('listening_sections')
          .select('*')
          .eq('test_id', test.id)

      for (const section of sections || []) {
        const { data: questions } = await supabase
            .from('listening_questions')
            .select('*')
            .eq('section_id', section.id)

        section.questions = questions || []
      }

      testWithDetails.sections = sections || []
    }

    if (type === 'reading') {
      const { data: sections } = await supabase
          .from('reading_sections')
          .select('*')
          .eq('test_id', test.id)

      for (const section of sections || []) {
        const { data: questions } = await supabase
            .from('reading_questions')
            .select('*')
            .eq('section_id', section.id)

        section.questions = questions || []
      }

      testWithDetails.sections = sections || []
    }

    if (type === 'writing') {
      testWithDetails.tasks = [
        { title: test.task1_title || '', question: test.task1_question || '', min_words: test.task1_min_words || 150 },
        { title: test.task2_title || '', question: test.task2_question || '', min_words: test.task2_min_words || 250 }
      ]
    }

    editingTest.value = JSON.parse(JSON.stringify(testWithDetails))
    showEditModal.value = true

  } catch (err) {
    console.error(err)
    alert('Failed to load test')
  }
}

/* ================= DELETE ================= */
const deleteTest = async (type: 'listening' | 'reading' | 'writing', id: string) => {
  if (!confirm('Delete test permanently?')) return
  await supabase.from(`${type}_tests`).delete().eq('id', id)
  await loadTests()
}

/* ================= SAVE HANDLER ================= */
const handleSaved = async () => {
  await loadTests()
  showAddModal.value = false
  showEditModal.value = false
}

/* ================= BODY SCROLL ================= */
watch([showAddModal, showEditModal], ([a, e]) => {
  document.body.style.overflow = (a || e) ? 'hidden' : 'auto'
})

/* ================= INIT ================= */
onMounted(async () => {
  await loadTests()
  loading.value = false
})
</script>
<template>
  <div class="min-h-screen bg-gray-50 px-8 py-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Teacher Panel</h1>

      <div class="flex justify-between mb-4">
        <h2 class="text-2xl font-semibold">Tests</h2>
        <CButton text="+ Add Test" variant="primary" @click="openAddTestModal"/>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div v-for="t in listeningTests" :key="t.id" class="bg-white p-4 rounded shadow">
          <h3 class="font-medium">{{ t.title }}</h3>
          <p class="text-sm text-gray-500">Listening</p>
          <div class="flex gap-2 mt-2">
            <button class="text-indigo-600" @click="openEditModal(t,'listening')">Edit</button>
            <button class="text-red-600" @click="deleteTest('listening', t.id)">Delete</button>
          </div>
        </div>

        <div v-for="t in readingTests" :key="t.id" class="bg-white p-4 rounded shadow">
          <h3 class="font-medium">{{ t.title }}</h3>
          <p class="text-sm text-gray-500">Reading</p>
          <div class="flex gap-2 mt-2">
            <button class="text-indigo-600" @click="openEditModal(t,'reading')">Edit</button>
            <button class="text-red-600" @click="deleteTest('reading', t.id)">Delete</button>
          </div>
        </div>

        <div v-for="t in writingTests" :key="t.id" class="bg-white p-4 rounded shadow">
          <h3 class="font-medium">{{ t.title }}</h3>
          <p class="text-sm text-gray-500">Writing</p>
          <div class="flex gap-2 mt-2">
            <button class="text-indigo-600" @click="openEditModal(t,'writing')">Edit</button>
            <button class="text-red-600" @click="deleteTest('writing', t.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <AddTestModal
        v-if="showAddModal"
        @close="showAddModal = false"
        @saved="handleSaved"
    />

    <UpdateTestModal
        v-if="showEditModal"
        :test="editingTest"
        :type="editingTestType"
        @close="showEditModal = false"
        @save="handleSaved"
    />
  </div>
</template>
