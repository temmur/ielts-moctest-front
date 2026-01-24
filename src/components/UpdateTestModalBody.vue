<template>
  <div class="space-y-4">
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="text-sm font-medium text-gray-700">Title</label>
        <input v-model="draft.title" class="mt-1 w-full rounded-xl border px-3 py-2" />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700">Section</label>
        <select v-model.number="draft.section" class="mt-1 w-full rounded-xl border px-3 py-2">
          <option :value="1">Section 1</option>
          <option :value="2">Section 2</option>
          <option :value="3">Section 3</option>
          <option :value="4">Section 4</option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label class="text-sm font-medium text-gray-700">Instruction</label>
        <textarea v-model="draft.instruction" rows="3" class="mt-1 w-full rounded-xl border px-3 py-2" />
      </div>
    </div>

    <!-- Questions (простая структура) -->
    <div class="rounded-2xl border p-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">Questions</h3>
        <button class="rounded-xl border px-3 py-2 text-sm" @click="addQuestion">+ Add</button>
      </div>

      <div class="mt-3 space-y-3">
        <div v-for="(q, i) in draft.questions" :key="q.id" class="rounded-xl bg-gray-50 p-3">
          <div class="flex items-center justify-between">
            <div class="font-medium text-sm">Question {{ i + 1 }}</div>
            <button class="text-sm text-red-600" @click="removeQuestion(i)" :disabled="draft.questions.length === 1">
              Remove
            </button>
          </div>

          <textarea v-model="q.prompt" rows="2" class="mt-2 w-full rounded-xl border bg-white px-3 py-2" placeholder="Question..." />
          <input v-model="q.answer" class="mt-2 w-full rounded-xl border bg-white px-3 py-2" placeholder="Answer..." />
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <button class="rounded-xl border px-4 py-2" @click="$emit('close')">Cancel</button>
      <button class="rounded-xl bg-black text-white px-4 py-2" @click="save">Save</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  test: { type: Object, required: true }
});
const emit = defineEmits(["save", "close"]);

const uid = () => (crypto?.randomUUID?.() || `id_${Math.random().toString(16).slice(2)}_${Date.now()}`);
const clone = (o) => JSON.parse(JSON.stringify(o));

function normalize(t) {
  const base = clone(t);
  base.title ??= "";
  base.section ??= 1;
  base.instruction ??= "";
  base.questions ??= [{ id: uid(), prompt: "", answer: "" }];
  if (!base.questions.length) base.questions = [{ id: uid(), prompt: "", answer: "" }];
  return base;
}

const draft = reactive(normalize(props.test));

watch(
    () => props.test,
    (v) => {
      const fresh = normalize(v);
      Object.keys(draft).forEach((k) => delete draft[k]);
      Object.assign(draft, fresh);
    },
    { deep: true, immediate: true }
);

function addQuestion() {
  draft.questions.push({ id: uid(), prompt: "", answer: "" });
}
function removeQuestion(i) {
  if (draft.questions.length === 1) return;
  draft.questions.splice(i, 1);
}
function save() {
  if (!draft.title.trim()) return;
  emit("save", clone(draft));
}
</script>


