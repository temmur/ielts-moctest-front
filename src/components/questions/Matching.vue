<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  question: {
    id: number
    left: string[]
    right: string[]
  }
  modelValue: Record<number, string>
  locked: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const update = (index: number, value: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [index]: value
  })
}
</script>

<template>
  <div class="mb-6">
    <div
        v-for="(item, index) in question.left"
        :key="index"
        class="flex items-center gap-4 mb-3"
    >
      <span class="w-48 font-medium">{{ item }}</span>

      <select
          :disabled="locked"
          :value="modelValue?.[index] || ''"
          @change="update(index, ($event.target as HTMLSelectElement).value)"
          class="border px-3 py-1 rounded w-48"
      >
        <option value="" disabled>Select</option>
        <option
            v-for="opt in question.right"
            :key="opt"
            :value="opt"
        >
          {{ opt }}
        </option>
      </select>
    </div>
  </div>
</template>
