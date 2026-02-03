<template>
  <div
      class="fixed left-0 right-0 z-50"
      :class="position === 'top' ? 'top-0' : 'bottom-0'"
  >
    <div class="mx-auto max-w-6xl px-3 sm:px-6 py-2">
      <div
          class="rounded-2xl border bg-white/90 backdrop-blur shadow-sm overflow-hidden"
      >
        <div class="flex items-center gap-3 px-3 py-2">
          <!-- Left: parts + questions -->
          <div class="flex-1 overflow-x-auto">
            <div class="flex items-center gap-4 min-w-max">
              <template v-for="(p, pIndex) in parts" :key="pIndex">
                <div class="flex items-center gap-2">
                  <div class="text-sm font-extrabold text-gray-800">
                    Part {{ pIndex + 1 }}
                  </div>

                  <div class="flex items-center gap-1">
                    <button
                        v-for="q in p.questions"
                        :key="q.global"
                        type="button"
                        class="h-7 w-7 rounded-full border text-[12px] font-extrabold transition"
                        :class="btnClass(q)"
                        :disabled="disabled"
                        @click="onClickQuestion(q)"
                        :title="`Go to Question ${q.global}`"
                    >
                      {{ q.global }}
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Right: arrows -->
          <div class="flex items-center gap-2">
            <button
                type="button"
                class="h-9 w-9 rounded-full border bg-white hover:bg-gray-50 flex items-center justify-center font-black disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="disabled || modelValue <= 0"
                @click="emit('update:modelValue', modelValue - 1)"
                title="Previous part"
            >
              ‹
            </button>

            <button
                type="button"
                class="h-9 w-9 rounded-full border bg-white hover:bg-gray-50 flex items-center justify-center font-black disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="disabled || modelValue >= parts.length - 1"
                @click="emit('update:modelValue', modelValue + 1)"
                title="Next part"
            >
              ›
            </button>
          </div>
        </div>

        <!-- Optional small legend -->
        <div class="px-3 pb-2 text-[11px] text-gray-500">
          Click a question number to jump to its part & question.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type QuestionLink = {
  global: number;      // 1..40
  partIndex: number;   // 0..3
  questionId: string;  // DOM id to scroll
};

type PartLinks = {
  partIndex: number;
  questions: QuestionLink[];
};

const props = defineProps<{
  modelValue: number;          // currentPartIndex
  parts: PartLinks[];          // structure for pagination
  disabled?: boolean;
  position?: "top" | "bottom";
  activeQuestion?: number | null; // optional highlight current question
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: number): void;
  (e: "go", payload: QuestionLink): void;
}>();

const position = props.position ?? "bottom";

function onClickQuestion(q: QuestionLink) {
  emit("go", q);
}

function btnClass(q: QuestionLink) {
  const isActivePart = q.partIndex === props.modelValue;
  const isActiveQ = props.activeQuestion != null && q.global === props.activeQuestion;

  if (isActiveQ) {
    return "bg-indigo-600 text-white border-indigo-600 shadow-sm";
  }
  if (isActivePart) {
    return "bg-gray-900 text-white border-gray-900";
  }
  return "bg-white text-gray-700 border-gray-300 hover:border-gray-400";
}
</script>
