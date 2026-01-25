<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Ref } from 'vue'

/* Props */
const props = defineProps<{
  test: any
  type: 'listening' | 'reading' | 'writing'
}>
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', test: any): void
}>()

/* Helper to clone object */
const clone = (o: any) => JSON.parse(JSON.stringify(o))

/* ================= LOCAL COPY ================= */
const localTest = reactive(clone(props.test))

watch(() => props.test, (v) => {
  Object.assign(localTest, clone(v))
}, { deep: true, immediate: true })

/* ================= SECTIONS ================= */
function addSection() {
  if (!localTest.sections) localTest.sections = []
  localTest.sections.push({
    title: '',
    parts: [],
    questions: []
  })
}

function duplicateSection(index: number) {
  const section = localTest.sections[index]
  const newSection = clone(section)
  // Reset IDs so backend inserts new rows
  newSection.id = null
  if (newSection.questions) {
    newSection.questions = newSection.questions.map(q => ({ ...q, id: null }))
  }
  localTest.sections.push(newSection)
}

/* ================= QUESTIONS ================= */
function addQuestion(sectionIndex: number, type: 'mcq' | 'matching' | 'sentence') {
  if (!localTest.sections[sectionIndex].questions) localTest.sections[sectionIndex].questions = []
  localTest.sections[sectionIndex].questions.push({
    id: null,
    type,
    question_text: '',
    choices: type === 'mcq' || type === 'matching' ? [''] : []
  })
}

function removeQuestion(sectionIndex: number, qIndex: number) {
  const questions = localTest.sections[sectionIndex].questions
  if (!questions || questions.length <= 1) return
  questions.splice(qIndex, 1)
}

function addChoice(sectionIndex: number, qIndex: number) {
  const q = localTest.sections[sectionIndex].questions[qIndex]
  if (q.choices) q.choices.push('')
}

function removeChoice(sectionIndex: number, qIndex: number, cIndex: number) {
  const q = localTest.sections[sectionIndex].questions[qIndex]
  q.choices.splice(cIndex, 1)
}

/* ================= WRITING TASKS ================= */
function addWritingTask() {
  if (!localTest.tasks) localTest.tasks = []
  localTest.tasks.push({ title: '', question: '', min_words: 150 })
}

/* ================= SAVE ================= */
function save() {
  emit('save', clone(localTest))
}
</script>

<template>
  <teleport to="body">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />

      <div class="relative w-full max-w-5xl bg-white rounded-2xl p-6 overflow-auto max-h-[90vh]">
        <h2 class="text-2xl font-semibold mb-4">Edit {{ props.type }} Test</h2>

        <!-- Title & Description -->
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
          <textarea v-model="localTest.description" class="w-full border rounded px-3 py-2" rows="3" />
        </div>

        <!-- LISTENING / READING SECTIONS -->
        <div v-if="props.type !== 'writing'">
          <div v-for="(section, sIndex) in localTest.sections" :key="sIndex" class="mb-4 border p-3 rounded">
            <div class="flex justify-between items-center mb-2">
              <input v-model="section.title" placeholder="Section title" class="font-semibold border px-2 py-1 rounded flex-1 mr-2"/>
              <div class="flex gap-2">
                <button class="text-blue-600 text-sm" @click="addSection()">+ Add Section</button>
                <button class="text-green-600 text-sm" @click="duplicateSection(sIndex)">Duplicate</button>
              </div>
            </div>

            <!-- Questions -->
            <div v-for="(q, qIndex) in section.questions" :key="qIndex" class="mb-2 border p-2 rounded">
              <div class="flex justify-between items-center mb-1">
                <span>{{ q.type.toUpperCase() }} Question {{ qIndex + 1 }}</span>
                <button class="text-red-500 text-sm" @click="removeQuestion(sIndex, qIndex)">Remove</button>
              </div>

              <textarea v-model="q.question_text" placeholder="Question text" class="w-full border px-2 py-1 rounded mb-1" />

              <!-- MCQ / Matching choices -->
              <div v-if="['mcq','matching'].includes(q.type)">
                <div v-for="(c, cIndex) in q.choices" :key="cIndex" class="flex gap-2 mb-1">
                  <input v-model="q.choices[cIndex]" placeholder="Choice" class="border rounded px-2 py-1 flex-1"/>
                  <button @click="removeChoice(sIndex,qIndex,cIndex)" class="text-red-500">x</button>
                </div>
                <button class="text-blue-600 text-sm" @click="addChoice(sIndex,qIndex)">+ Add Choice</button>
              </div>
            </div>

            <!-- Add Question buttons -->
            <div class="flex gap-2 mt-2">
              <button class="text-sm text-blue-600" @click="addQuestion(sIndex,'mcq')">+ MCQ</button>
              <button class="text-sm text-blue-600" @click="addQuestion(sIndex,'matching')">+ Matching</button>
              <button class="text-sm text-blue-600" @click="addQuestion(sIndex,'sentence')">+ Sentence Completion</button>
            </div>
          </div>
        </div>

        <!-- WRITING TASKS -->
        <div v-else>
          <div v-for="(task, i) in localTest.tasks" :key="i" class="mb-4 border p-3 rounded">
            <input v-model="task.title" placeholder="Task Title" class="w-full border px-3 py-2 rounded mb-2"/>
            <textarea v-model="task.question" placeholder="Question" class="w-full border px-3 py-2 rounded mb-2"/>
            <input type="number" v-model="task.min_words" placeholder="Min Words" class="w-full border px-3 py-2 rounded mb-2"/>
          </div>
          <button class="text-blue-600 text-sm" @click="addWritingTask">+ Add Task</button>
        </div>

        <div class="flex justify-end gap-3 mt-10">
          <button class="rounded-xl border px-4 py-2" @click="$emit('close')">Cancel</button>
          <button class="rounded-xl bg-black text-white px-4 py-2" @click="save">Save</button>
        </div>
      </div>
    </div>
  </teleport>
</template>
