<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import AddTestModal from "@/components/modals/AddTestModal.vue"
import CButton from "@/components/forms/CButton.vue"

/* ================= STATE ================= */
const loading = ref(true)
const showModal = ref(false)                  // single modal for add/edit
const modalMode = ref<'add' | 'edit'>('add') // mode for modal
const editingTest = ref<any>(null)           // full test object
const editingTestType = ref<'listening' | 'reading' | 'writing' | ''>('')

// All tests
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

/* ================= OPEN MODAL ================= */
// Add test
const openAddTestModal = () => {
  modalMode.value = 'add'
  editingTest.value = null
  editingTestType.value = ''
  showModal.value = true
}

// Edit test
const openEditModal = async (test: any, type: 'listening' | 'reading' | 'writing') => {
  modalMode.value = 'edit'
  editingTestType.value = type

  try {
    const testWithDetails: any = { ...test }

    // Listening test: load sections → questions
    if (type === 'listening') {
      const { data: sections } = await supabase.from('listening_sections').select('*').eq('test_id', test.id)
      if (sections?.length) {
        for (const section of sections) {
          const { data: questions } = await supabase
              .from('listening_questions')
              .select('*')
              .eq('section_id', section.id)
          section.questions = questions || []
        }
      }
      testWithDetails.sections = sections || []
    }

    // Reading test: load sections → questions
    if (type === 'reading') {
      const { data: sections } = await supabase.from('reading_sections').select('*').eq('test_id', test.id)
      if (sections?.length) {
        for (const section of sections) {
          const { data: questions } = await supabase
              .from('reading_questions')
              .select('*')
              .eq('section_id', section.id)
          section.questions = questions || []
        }
      }
      testWithDetails.sections = sections || []
    }

    // Writing test: prepare tasks
    if (type === 'writing') {
      testWithDetails.tasks = [
        { title: test.task1_title || '', question: test.task1_question || '', min_words: test.task1_min_words || 150 },
        { title: test.task2_title || '', question: test.task2_question || '', min_words: test.task2_min_words || 250 }
      ]
    }

    editingTest.value = testWithDetails
    showModal.value = true

  } catch (err) {
    console.error('OPEN EDIT ERROR:', err)
    alert('Failed to load test data')
  }
}

/* ================= DELETE TEST ================= */
const deleteTest = async (type: 'listening' | 'reading' | 'writing', id: string) => {
  if (!confirm('Delete test permanently?')) return
  await supabase.from(`${type}_tests`).delete().eq('id', id)
  await loadTests()
}

/* ================= HANDLE SAVED ================= */
const handleSaved = async () => {
  if (modalMode.value === 'edit' && editingTest.value) {
    try {
      // Update the test depending on type
      const type = editingTestType.value
      if (type === 'listening' || type === 'reading') {
        await supabase.from(`${type}_tests`).update({
          title: editingTest.value.title,
          duration: editingTest.value.duration,
          description: editingTest.value.description
        }).eq('id', editingTest.value.id)

        // Optionally update sections and questions here if needed
        // Example: update section titles, questions text etc.

      } else if (type === 'writing') {
        await supabase.from('writing_tests').update({
          title: editingTest.value.title,
          duration: editingTest.value.duration,
          description: editingTest.value.description,
          task1_title: editingTest.value.tasks[0]?.title || '',
          task1_question: editingTest.value.tasks[0]?.question || '',
          task1_min_words: editingTest.value.tasks[0]?.min_words || 150,
          task2_title: editingTest.value.tasks[1]?.title || '',
          task2_question: editingTest.value.tasks[1]?.question || '',
          task2_min_words: editingTest.value.tasks[1]?.min_words || 250
        }).eq('id', editingTest.value.id)
      }

    } catch (err) {
      console.error('EDIT SAVE ERROR:', err)
      alert('Failed to save changes')
    }
  }

  await loadTests()
  showModal.value = false
}

/* ================= MODAL BODY SCROLL ================= */
watch(showModal, (v) => {
  document.body.style.overflow = v ? 'hidden' : 'auto'
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

      <!-- Add Test Button -->
      <div class="flex justify-between mb-4">
        <h2 class="text-2xl font-semibold">Tests</h2>
        <CButton text="+ Add Test" variant="primary" @click="openAddTestModal"/>
      </div>

      <!-- All Tests Grid -->
      <div class="grid md:grid-cols-3 gap-6">
        <!-- Listening Tests -->
        <div v-for="t in listeningTests" :key="t.id" class="bg-white p-4 rounded shadow">
          <h3 class="font-medium">{{ t.title }}</h3>
          <p class="text-sm text-gray-500">Listening</p>
          <div class="flex gap-2 mt-2">
            <button class="text-indigo-600" @click="openEditModal(t,'listening')">Edit</button>
            <button class="text-red-600" @click="deleteTest('listening', t.id)">Delete</button>
          </div>
        </div>

        <!-- Reading Tests -->
        <div v-for="t in readingTests" :key="t.id" class="bg-white p-4 rounded shadow">
          <h3 class="font-medium">{{ t.title }}</h3>
          <p class="text-sm text-gray-500">Reading</p>
          <div class="flex gap-2 mt-2">
            <button class="text-indigo-600" @click="openEditModal(t,'reading')">Edit</button>
            <button class="text-red-600" @click="deleteTest('reading', t.id)">Delete</button>
          </div>
        </div>

        <!-- Writing Tests -->
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

     SINGLE MODAL FOR ADD & EDIT
    <AddTestModal
        v-if="showModal"
        :mode="modalMode"
        :editingTest="editingTest"
        @close="showModal = false"
        @saved="handleSaved"
    />
  </div>
</template>
