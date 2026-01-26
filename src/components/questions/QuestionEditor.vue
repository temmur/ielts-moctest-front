<script setup>
const props = defineProps({
  question: { type: Object, required: true }
})


const types = ['mcq','matching','sentence_completion','short_answer']

const addOption = () => {
  if (!props.question.options) props.question.options = []
  props.question.options.push('')
}

</script>

<template>
  <div class="border p-3 rounded-lg bg-white space-y-2">

    <select v-model="question.type" class="input">
      <option v-for="t in types" :value="t">{{ t }}</option>
    </select>

    <input v-model="question.question" class="input" placeholder="Question text" />

    <!-- MCQ -->
    <div v-if="question.type === 'mcq'">
      <div
          v-for="(opt, i) in question.options"
          :key="i"
          class="flex items-center gap-2"
      >
        <input
            type="radio"
            :name="'mcq_' + question.id"
            :value="opt"
            v-model="question.answer"
        />
        <input
            v-model="question.options[i]"
            class="input flex-1"
            placeholder="Option"
        />
      </div>

      <button @click="addOption" class="btn mt-2">+ Option</button>
    </div>


    <!-- Sentence Completion -->
    <div v-if="question.type === 'sentence_completion'">
      <input v-model="question.answer" class="input" placeholder="Correct answer" />
    </div>

    <!-- Short Answer -->
    <div v-if="question.type === 'short_answer'">
      <input v-model="question.answer" class="input" placeholder="Answer" />
    </div>

    <!-- Matching -->
    <div v-if="question.type === 'matching'">
      <textarea v-model="question.answer" class="input" placeholder="Use JSON pairs"></textarea>
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
.btn {
  background: #6366f1;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
}
</style>
