<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  question: {
    id: number
    before: string
    after: string
  }
  modelValue: string
  locked: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const update = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="flex items-center gap-2 mb-4">
    <span>{{ question.before }}</span>

    <input
        :value="modelValue"
        @input="update"
        :disabled="locked"
        type="text"
        class="w-32 border-b border-gray-400 focus:outline-none focus:border-indigo-600"
    />

    <span>{{ question.after }}</span>
  </div>
</template>
