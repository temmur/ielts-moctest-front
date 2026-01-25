<script setup>
import QuestionEditor from './QuestionEditor.vue'

const props = defineProps({
  section: Object,
  index: Number
})


const addQuestion = (type) => {
  if (!props.section.questions) props.section.questions = []

  props.section.questions.push({
    type,
    question: '',
    options: type === 'mcq' ? ['',''] : [],
    answer: ''
  })
}

const duplicateQuestion = (i) => {
  const q = JSON.parse(JSON.stringify(props.section.questions[i]))
  props.section.questions.push(q)
}

const removeQuestion = (i) => {
  props.section.questions.splice(i,1)
}
</script>

<template>
  <div class="border p-4 rounded-xl bg-slate-50">

    <div class="flex justify-between items-center mb-3">
      <input v-model="section.title" class="input" placeholder="Section title" />
    </div>

    <div class="space-y-3">
      <QuestionEditor
          v-for="(q, i) in section.questions"
          :key="i"
          :question="q"
      />

      <div class="flex gap-2 mt-3 flex-wrap">
        <button class="btn-sm" @click="addQuestion('mcq')">+ MCQ</button>
        <button class="btn-sm" @click="addQuestion('matching')">+ Matching</button>
        <button class="btn-sm" @click="addQuestion('sentence_completion')">+ Sentence</button>
        <button class="btn-sm" @click="addQuestion('short_answer')">+ Short</button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 6px;
}
.btn-sm {
  background: #6366f1;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
}
</style>
