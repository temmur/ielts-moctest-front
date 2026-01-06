<script setup>
import { computed } from 'vue'

// ✅ Capture props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: [String, Boolean],
    default: false
  },
  inputClass: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default', // options: default, outlined, filled
    validator: (val) => ['default', 'outlined', 'filled'].includes(val)
  },
  label: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// ✅ Use props.variant instead of variant
const baseClasses = computed(() => {
  switch (props.variant) {
    case 'outlined':
      return 'border border-gray-400 rounded px-3 py-2 focus:border-blue-500'
    case 'filled':
      return 'bg-gray-100 rounded px-3 py-2 focus:bg-white'
    default:
      return 'border-b border-gray-400 px-2 py-1 focus:border-blue-500'
  }
})
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="props.label" class="text-sm font-medium text-gray-700">
      {{ props.label }}
    </label>

    <input
        :type="props.type"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :value="props.modelValue"
        @input="emit('update:modelValue', $event.target.value)"
        :class="[baseClasses, props.inputClass, props.disabled ? 'opacity-50 cursor-not-allowed' : '', props.error ? 'border-red-500 focus:border-red-500' : '']"
    />

    <p v-if="props.error" class="text-xs text-red-600">
      {{ typeof props.error === 'string' ? props.error : 'Invalid input' }}
    </p>
  </div>
</template>
