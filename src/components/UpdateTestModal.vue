<script setup>
import { ref, watch } from 'vue'
import SectionEditor from '@/components/questions/SectionEditor.vue'

const props = defineProps({
  test: { type: Object, required: true },
  type: { type: String, required: true }
})

const emit = defineEmits(['close', 'save'])

// deep clone helper
const clone = (v) => JSON.parse(JSON.stringify(v))

const localTest = ref(clone(props.test))

watch(() => props.test, (v) => {
  localTest.value = clone(v)
}, { deep: true, immediate: true })

// ensure structure exists
if (!localTest.value.content) localTest.value.content = []

// ADD SECTION — duplicate first section structure
const addSection = () => {
  localTest.value.content.push({
    title: `Section ${localTest.value.content.length + 1}`,
    instructions: '',
    questions: []
  })
}

// SAVE
const save = () => {
  emit('save', clone(localTest.value))
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-xl p-6">

      <h2 class="text-2xl font-semibold mb-4">Edit Test</h2>

      <div class="space-y-4">
        <input v-model="localTest.title" class="input" placeholder="Title" />
        <input v-model="localTest.time_limit" type="number" class="input" placeholder="Time limit (min)" />
      </div>

      <div class="mt-6 space-y-4">
        <SectionEditor
            v-for="(section, i) in localTest.content"
            :key="i"
            :section="section"
            :index="i"
        />
      </div>

      <button @click="addSection" class="btn mt-4">+ Add Section</button>

      <div class="flex justify-end gap-3 mt-6">
        <button @click="$emit('close')" class="btn-gray">Cancel</button>
        <button @click="save" class="btn">Save</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 8px;
}
.btn {
  background: #4f46e5;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
}
.btn-gray {
  background: #e5e7eb;
  padding: 10px 16px;
  border-radius: 8px;
}
</style>
