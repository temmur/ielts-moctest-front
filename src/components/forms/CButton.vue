<template>
  <button
      :class="buttonClasses"
      :disabled="disabled"
      @click="$emit('click', $event)"
  >
    <span class="button__content">
      <span v-if="$slots.prefix" class="button__prefix">
        <slot name="prefix" />
      </span>

      <span class="button__text">
        <slot>{{ text }}</slot>
      </span>

      <span v-if="$slots.suffix" class="button__suffix">
        <slot name="suffix" />
      </span>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  text: {
    type: String,
    default: ''
  },

  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'text', 'red'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },

  error: {
    type: Boolean,
    default: false
  },
  buttonClass: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])

const buttonClasses = computed(() => [
  'button',
  `button--${props.size}`,
  `button--${props.variant}`,
  {
    'button--disabled': props.disabled,
    'button--error': props.error
  },
  props.buttonClass // User-provided classes
])
</script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 500;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer !important;
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;
  outline: none;
}


.button--small {
  padding: 6px 12px;
  font-size: 14px;
  min-height: 32px;
}

.button--medium {
  padding: 8px 26px;
  font-size: 16px;
  min-height: 40px;
}

.button--large {
  padding: 12px 24px;
  font-size: 18px;
  min-height: 48px;
}

.button--primary {
  background-color: #3b82f6;
  color: white;
}

.button--primary:hover:not(.button--disabled) {
  background-color: #2563eb;
}

.button--secondary {
  background-color: #6b7280;
  color: white;
}

.button--secondary:hover:not(.button--disabled) {
  background-color: #4b5563;
}
.button--red{
  background-color: red;
  color: white;
}
.button--outline {
  background-color: transparent;
  color: #374151;
  border-color: #d1d5db;
}

.button--outline:hover:not(.button--disabled) {
  background-color: #f3f4f6;
}

.button--text {
  background-color: transparent;
  color: #3b82f6;
  border: none;
  padding: 4px 8px;
}

.button--text:hover:not(.button--disabled) {
  background-color: #eff6ff;
}

/* Error state */
.button--error {
  background-color: #ef4444;
  color: white;
}

.button--error:hover:not(.button--disabled) {
  background-color: #dc2626;
}

.button--disabled,
.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

/* Content layout */
.button__content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.button__prefix,
.button__suffix {
  display: flex;
  align-items: center;
}

.button__text {
  display: inline-block;
}
</style>
