<script setup lang="ts">
import { computed } from "vue";

type Props = {
  /** 0-based index текущей части */
  modelValue: number;
  /** сколько всего частей */
  total: number;

  /** подпись: "Part", "Section", "Page" и т.д. */
  label?: string;

  /** если нужно блокировать кнопки, пока тест не начался */
  disabled?: boolean;

  /** показать кнопки сверху/снизу? (по умолчанию снизу) */
  showHint?: boolean;

  /** авто-скролл наверх при переключении */
  scrollTop?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  label: "Part",
  disabled: false,
  showHint: true,
  scrollTop: true,
});

const emit = defineEmits<{
  (e: "update:modelValue", v: number): void;
  (e: "prev", v: number): void;
  (e: "next", v: number): void;
}>();

const safeTotal = computed(() => Math.max(1, Number(props.total || 1)));

const safeIndex = computed(() => {
  const i = Number(props.modelValue || 0);
  const max = safeTotal.value - 1;
  return Math.min(Math.max(i, 0), max);
});

const canPrev = computed(() => safeIndex.value > 0);
const canNext = computed(() => safeIndex.value < safeTotal.value - 1);

function scrollToTopSmooth() {
  if (!props.scrollTop) return;
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch {
    window.scrollTo(0, 0);
  }
}

function setIndex(next: number) {
  const max = safeTotal.value - 1;
  const clamped = Math.min(Math.max(next, 0), max);
  emit("update:modelValue", clamped);
  scrollToTopSmooth();
  return clamped;
}

function onPrev() {
  if (props.disabled || !canPrev.value) return;
  const v = setIndex(safeIndex.value - 1);
  emit("prev", v);
}

function onNext() {
  if (props.disabled || !canNext.value) return;
  const v = setIndex(safeIndex.value + 1);
  emit("next", v);
}
</script>

<template>
  <div
      class="rounded-3xl border bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3"
  >
    <div class="text-sm text-gray-700 font-semibold">
      {{ label }}
      <b>{{ safeIndex + 1 }}</b>
      <span class="text-gray-400">/</span>
      {{ safeTotal }}
      <div v-if="showHint" class="text-xs text-gray-500 font-medium mt-1">
        Use buttons to switch {{ label.toLowerCase() }}.
      </div>
    </div>

    <div class="flex items-center gap-2 w-full sm:w-auto">
      <button
          type="button"
          class="w-1/2 sm:w-auto px-5 py-3 rounded-2xl border bg-white hover:bg-gray-50 font-extrabold transition disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="disabled || !canPrev"
          @click="onPrev"
      >
        ← Previous
      </button>

      <button
          type="button"
          class="w-1/2 sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold transition disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="disabled || !canNext"
          @click="onNext"
      >
        Next →
      </button>
    </div>
  </div>
</template>
