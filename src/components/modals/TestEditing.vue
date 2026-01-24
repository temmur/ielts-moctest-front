<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import CButton from "@/components/forms/CButton.vue"
import { supabase } from '@/lib/supabase'

const props = defineProps<{
  editingTest: any
  testType: 'listening' | 'reading' | 'writing'
}>

const emit = defineEmits(['close', 'saved'])

// Local reactive copy of the test
const localTest = reactive(JSON.parse(JSON.stringify(props.editingTest || {})))

// Watch for changes in props
watch(() => props.editingTest, (val) => {
  if (!val) return
  Object.assign(localTest, JSON.parse(JSON.stringify(val)))
})

// Save function
const saveTest = async () => {
  try {
    if (!localTest.id) throw new Error('Missing test ID')

    if (props.testType === 'listening' || props.testType === 'reading') {
      await supabase.from(`${props.testType}_tests`).update({
        title: localTest.title,
        duration: localTest.duration,
        description: localTest.description
      }).eq('id', localTest.id)

      // TODO: add logic to update sections and questions here
    }

    if (props.testType === 'writing') {
      await supabase.from('writing_tests').update({
        title: localTest.title,
        duration: localTest.duration,
        description: localTest.description,
        task1_title: localTest.tasks[0]?.title || '',
        task1_question: localTest.tasks[0]?.question || '',
        task1_min_words: localTest.tasks[0]?.min_words || 150,
        task2_title: localTest.tasks[1]?.title || '',
        task2_question: localTest.tasks[1]?.question || '',
        task2_min_words: localTest.tasks[1]?.min_words || 250
      }).eq('id', localTest.id)
    }

    emit('saved')
    emit('close')
  } catch (err) {
    console.error('Save error:', err)
    alert('Failed to save test. Check console.')
  }
}

// Functions to add/remove sections, parts, questions
const addSection = (partIndex: number) => {
  localTest.sections[partIndex].parts.push({
    title: '',
    questions: []
  })
}

const addPart = () => {
  localTest.sections.push({
    title: '',
    parts: []
  })
}

const addQuestion = (sectionIndex: number, partIndex: number, type: string) => {
  localTest.sections[sectionIndex].parts[partIndex].questions.push({
    type,
    question_text: '',
    choices: []
  })
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white w-full max-w-5xl p-6 rounded-xl overflow-auto max-h-[90vh]">

      <h2 class="text-2xl font-semibold mb-4">Edit {{ props.testType | capitalize }} Test</h2>

      <!-- Title & Duration -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label>Title</label>
          <input v-model="localTest.title" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label>Duration</label>
          <input type="number" v-model="localTest.duration" class="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div class="mb-4">
        <label>Description</label>
        <textarea v-model="localTest.description" class="w-full border rounded px-3 py-2" />
      </div>

      <!-- Sections & Questions for Listening/Reading -->
      <div v-if="props.testType !== 'writing'">
        <div v-for="(section, sIndex) in localTest.sections" :key="sIndex" class="mb-4 border p-3 rounded">
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold">Section {{ sIndex + 1 }}</span>
            <button class="text-blue-600 text-sm" @click="addPart">+ Add Part</button>
          </div>
          <div v-for="(part, pIndex) in section.parts" :key="pIndex" class="mb-2 border p-2 rounded">
            <div class="flex justify-between items-center mb-1">
              <span>Part {{ pIndex + 1 }}</span>
              <button class="text-blue-600 text-sm" @click="addSection(sIndex)">+ Add Section</button>
            </div>

            <!-- Questions -->
            <div v-for="(q, qIndex) in part.questions" :key="qIndex" class="mb-2">
              <input v-model="q.question_text" placeholder="Question Text" class="w-full border px-2 py-1 rounded mb-1" />
              <!-- Choices for MCQ, matching etc -->
              <div v-if="['multiple_choice','matching'].includes(q.type)">
                <div v-for="(choice, cIndex) in q.choices" :key="cIndex" class="flex gap-2 mb-1">
                  <input v-model="q.choices[cIndex]" placeholder="Choice" class="border rounded px-2 py-1 flex-1" />
                  <button @click="q.choices.splice(cIndex,1)" class="text-red-500">x</button>
                </div>
                <button @click="q.choices.push('')" class="text-blue-600 text-sm">+ Add Choice</button>
              </div>
            </div>
            <button @click="addQuestion(sIndex,pIndex,'multiple_choice')" class="text-sm text-blue-600">+ Add Question</button>
          </div>
        </div>
      </div>

      <!-- Writing Tasks -->
      <div v-else>
        <div v-for="(task, i) in localTest.tasks" :key="i" class="mb-4 border p-3 rounded">
          <input v-model="task.title" placeholder="Task Title" class="w-full border px-3 py-2 rounded mb-2" />
          <textarea v-model="task.question" placeholder="Question" class="w-full border px-3 py-2 rounded mb-2" />
          <input type="number" v-model="task.min_words" placeholder="Min Words" class="w-full border px-3 py-2 rounded" />
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <CButton text="Cancel" variant="secondary" @click="emit('close')" />
        <CButton text="Save" variant="primary" @click="saveTest" />
      </div>

    </div>
  </div>
</template>
