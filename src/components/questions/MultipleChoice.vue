<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  question: {
    id: number
    text: string
    options: string[]
  }
  modelValue: string
  locked: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const select = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="mb-6">
    <p class="mb-3 font-medium">{{ question.text }}</p>

    <div class="space-y-2">
      <label
          v-for="(opt, i) in question.options"
          :key="i"
          class="flex items-center gap-2 cursor-pointer"
      >
        <input
            type="radio"
            :value="opt"
            :checked="modelValue === opt"
            :disabled="locked"
            @change="select(opt)"
        />
        <span>{{ opt }}</span>
      </label>
    </div>
  </div>
</template>
