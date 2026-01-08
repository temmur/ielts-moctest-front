<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-3xl p-6 shadow-lg overflow-auto">
      <h2 class="text-2xl font-semibold mb-4">Add New Test</h2>

      <!-- Step 1: Type -->
      <div class="mb-4">
        <label class="font-medium">Select Test Type:</label>
        <select v-model="selectedType" class="w-full border p-2 rounded mt-2">
          <option disabled value="">Select</option>
          <option v-for="type in typeOptions" :key="type">{{ type }}</option>
        </select>
      </div>

      <!-- Step 2: Test Title -->
      <div v-if="selectedType" class="mb-4">
        <label class="font-medium">Test Title:</label>
        <input v-model="testTitle" type="text" placeholder="Enter test title"
               class="w-full border p-2 rounded mt-2" />
      </div>

      <!-- Step 3: Sections -->
      <div v-if="testTitle" class="mb-4">
        <h3 class="font-semibold mb-2">Sections</h3>
        <div v-for="(section, sIndex) in sections" :key="sIndex" class="border rounded p-4 mb-4">
          <input v-model="section.title" placeholder="Section title"
                 class="w-full border p-2 rounded mb-2" />

          <textarea v-model="section.instruction" placeholder="Instruction / Question text (e.g. Transport from Bayswater)"
                    class="w-full border p-2 rounded mb-4"></textarea>

          <div class="mb-2 font-medium">Questions:</div>
          <div v-for="(q, qIndex) in section.questions" :key="qIndex" class="flex gap-2 items-center mb-2">
            <span>{{ qIndex + 1 }}.</span>
            <input v-model="q.questionText" placeholder="Question text" class="border p-2 rounded w-1/2" />
            <input v-model="q.correctAnswer" placeholder="Correct answer" class="border p-2 rounded w-1/3" />
            <button @click="removeQuestion(sIndex, qIndex)" class="text-red-600 hover:underline">Remove</button>
          </div>

          <button @click="addQuestion(sIndex)" class="text-indigo-600 hover:underline mt-2">
            + Add Question
          </button>
        </div>

        <button @click="addSection" class="text-indigo-600 hover:underline">
          + Add Section
        </button>
      </div>

      <!-- Submit -->
      <div class="flex justify-end mt-6 gap-4">
        <button @click="$emit('close')" class="px-4 py-2 border rounded">Cancel</button>
        <button @click="submitTest" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500">
          Save Test
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits } from 'vue'
const emit = defineEmits()
import { supabase } from '@/lib/supabase'

const typeOptions = ["Listening", "Reading", "Writing"]
const selectedType = ref("")
const testTitle = ref("")
const sections = ref([
  {
    title: "Section 1",
    instruction: "",
    questions: [
      { questionText: "", correctAnswer: "" }
    ]
  }
])

const addSection = () => {
  sections.value.push({ title: `Section ${sections.value.length + 1}`, instruction: "", questions: [{ questionText: "", correctAnswer: "" }] })
}

const addQuestion = (sIndex: number) => {
  sections.value[sIndex].questions.push({ questionText: "", correctAnswer: "" })
}

const removeQuestion = (sIndex: number, qIndex: number) => {
  sections.value[sIndex].questions.splice(qIndex, 1)
}

// Submit test
const submitTest = async () => {
  if (!selectedType.value || !testTitle.value) {
    alert("Please select type and enter title")
    return
  }

  // 1️⃣ Add test
  const tableName = selectedType.value.toLowerCase() + "_tests"
  const { data: test, error } = await supabase.from(tableName).insert([{ title: testTitle.value }]).select().single()
  if (error) { alert(error.message); return }

  // 2️⃣ Add sections
  for (const section of sections.value) {
    const { data: sectionData, error: secErr } = await supabase
        .from(tableName + "_sections")
        .insert([{ test_id: test.id, title: section.title, instruction: section.instruction }])
        .select()
        .single()

    if (secErr) { alert(secErr.message); return }

    // 3️⃣ Add questions
    for (const q of section.questions) {
      const { error: qErr } = await supabase
          .from(tableName + "_questions")
          .insert([{ section_id: sectionData.id, text_before: q.questionText, correct_answer: q.correctAnswer }])
      if (qErr) { alert(qErr.message); return }
    }
  }

  alert("Test added successfully!")
  // close modal
  $emit('close')
}
</script>
