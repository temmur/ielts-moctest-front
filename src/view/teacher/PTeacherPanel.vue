<!--<script setup lang="ts">-->
<!--import {ref, onMounted, watch} from 'vue'-->
<!--import { supabase } from '@/lib/supabase'-->
<!--import AddTestModal from "@/components/modals/AddTestModal.vue";-->
<!--import CButton from "@/components/forms/CButton.vue";-->
<!--import UpdateTestModal from "@/components/UpdateTestModal.vue";-->
<!--import UploadTest from "@/components/UploadTest.vue";-->

<!--const loading = ref(true)-->
<!--const showAddTestModal = ref(false)-->

<!--// Students and tests-->
<!--const students = ref<any[]>([])-->
<!--const listeningTests = ref<any[]>([])-->
<!--const readingTests = ref<any[]>([])-->
<!--const writingTests = ref<any[]>([])-->

<!--// Load students with results-->
<!--const loadStudents = async () => {-->
<!--  const { data } = await supabase-->
<!--      .from('profiles')-->
<!--      .select(`-->
<!--      id,-->
<!--      full_name,-->
<!--      role,-->
<!--      student_tests (-->
<!--        id,-->
<!--        listening_score,-->
<!--        reading_score,-->
<!--        writing_score,-->
<!--        speaking_score,-->
<!--        overall_band-->
<!--      )-->
<!--    `)-->
<!--      .eq('role', 'student')-->

<!--  students.value = data || []-->
<!--}-->

<!--// Load all tests-->
<!--const loadTests = async () => {-->
<!--  const { data: lData } = await supabase-->
<!--      .from('listening_tests')-->
<!--      .select('*')-->
<!--      .order('created_at', { ascending: false })-->
<!--  listeningTests.value = lData || []-->

<!--  const { data: rData } = await supabase-->
<!--      .from('reading_tests')-->
<!--      .select('*')-->
<!--      .order('created_at', { ascending: false })-->
<!--  readingTests.value = rData || []-->

<!--  const { data: wData } = await supabase-->
<!--      .from('writing_tests')-->
<!--      .select('*')-->
<!--      .order('created_at', { ascending: false })-->
<!--  writingTests.value = wData || []-->
<!--}-->

<!--// Delete student results-->
<!--const clearResults = async (studentTestId: string) => {-->
<!--  if (!confirm('Delete all results for this student?')) return-->

<!--  await supabase-->
<!--      .from('student_tests')-->
<!--      .delete()-->
<!--      .eq('id', studentTestId)-->

<!--  loadStudents()-->
<!--}-->

<!--// Delete test-->
<!--const deleteTest = async (type: string, testId: string) => {-->
<!--  if (!confirm('Delete test permanently?')) return-->

<!--  await supabase-->
<!--      .from(type + '_tests')-->
<!--      .delete()-->
<!--      .eq('id', testId)-->

<!--  loadTests()-->
<!--}-->

<!--onMounted(async () => {-->
<!--  await loadStudents()-->
<!--  await loadTests()-->
<!--  loading.value = false-->
<!--})-->

<!--// Reload after adding test-->
<!--const handleTestAdded = () => {-->
<!--  showAddTestModal.value = false-->
<!--  loadTests()-->
<!--}-->
<!--watch(showAddTestModal, (newValue)=> {-->
<!--  if(newValue) document.body.style.overflowY = 'hidden'-->
<!--  else document.body.style.overflowY = 'auto'-->
<!--})-->
<!--const handleTextSizeChange = (size) => {-->
<!--  console.log('Text size changed to:', size)-->
<!--  // You can also store this in a global store-->
<!--}-->

<!--</script>-->
<!--<template>-->
<!--  <div class="min-h-screen bg-gray-50 px-8 py-6">-->
<!--    <div class="max-w-7xl mx-auto">-->
<!--      <h1 class="text-3xl font-bold mb-8">Teacher Panel</h1>-->
<!--      &lt;!&ndash; Students Results &ndash;&gt;-->
<!--      <section class="mb-12">-->
<!--        <h2 class="text-2xl font-semibold mb-4">Students Results</h2>-->

<!--        <div class="overflow-x-auto border rounded-lg border-blue-500/70">-->
<!--          <table class="min-w-full text-sm">-->
<!--            <thead class="bg-blue-500/20 backdrop-blur-xl">-->
<!--            <tr class="text-blue-900">-->
<!--              <th class="p-3">Student</th>-->
<!--              <th class="p-3">Listening</th>-->
<!--              <th class="p-3">Reading</th>-->
<!--              <th class="p-3">Writing</th>-->
<!--              <th class="p-3">Speaking</th>-->
<!--              <th class="p-3">Overall</th>-->
<!--              <th class="p-3"></th>-->
<!--            </tr>-->
<!--            </thead>-->

<!--            <tbody>-->
<!--            <tr-->
<!--                v-for="student in students"-->
<!--                :key="student.id"-->
<!--                class="border-t"-->
<!--            >-->
<!--              <td class="p-3 font-medium">{{ student.full_name }}</td>-->
<!--              <td class="p-3 text-center">{{ student.student_tests?.listening_score ?? '-' }}</td>-->
<!--              <td class="p-3 text-center">{{ student.student_tests?.reading_score ?? '-' }}</td>-->
<!--              <td class="p-3 text-center">{{ student.student_tests?.writing_score ?? '-' }}</td>-->
<!--              <td class="p-3 text-center">{{ student.student_tests?.speaking_score ?? '-' }}</td>-->
<!--              <td class="p-3 text-center font-semibold">{{ student.student_tests?.overall_band ?? '-' }}</td>-->
<!--              <td class="p-3 text-right">-->
<!--                <button-->
<!--                    @click="clearResults(student.student_tests?.id)"-->
<!--                    class="text-red-600 hover:underline"-->
<!--                >Clear</button>-->
<!--              </td>-->
<!--            </tr>-->
<!--            </tbody>-->
<!--          </table>-->
<!--        </div>-->
<!--      </section>-->

<!--      &lt;!&ndash; Tests Management &ndash;&gt;-->
<!--      <section>-->
<!--        <div class="flex justify-between items-center mb-4">-->
<!--          <h2 class="text-2xl font-semibold">Tests Management</h2>-->
<!--          <CButton-->
<!--              @click="showAddTestModal = true"-->
<!--              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"-->
<!--              text="+ Add Test"-->
<!--              variant="primary"-->
<!--              size="medium"-->
<!--          />-->
<!--        </div>-->

<!--        <div class="grid md:grid-cols-3 gap-6">-->
<!--          <div v-for="test in listeningTests" :key="test.id" class="bg-white p-4 rounded shadow">-->
<!--            <h3 class="font-medium">{{ test.title }}</h3>-->
<!--            <p class="text-sm text-gray-500">Listening</p>-->
<!--            <div class="flex gap-2 mt-2">-->
<!--              <button class="text-indigo-600 hover:underline">Edit</button>-->
<!--              <button @click="deleteTest('listening', test.id)" class="text-red-600 hover:underline">Delete</button>-->
<!--            </div>-->
<!--          </div>-->

<!--          <div v-for="test in readingTests" :key="test.id" class="bg-white p-4 rounded shadow">-->
<!--            <h3 class="font-medium">{{ test.title }}</h3>-->
<!--            <p class="text-sm text-gray-500">Reading</p>-->
<!--            <div class="flex gap-2 mt-2">-->
<!--              <button class="text-indigo-600 hover:underline">Edit</button>-->
<!--              <button @click="deleteTest('reading', test.id)" class="text-red-600 hover:underline">Delete</button>-->
<!--            </div>-->
<!--          </div>-->

<!--          <div v-for="test in writingTests" :key="test.id" class="bg-white p-4 rounded shadow">-->
<!--            <h3 class="font-medium">{{ test.title }}</h3>-->
<!--            <p class="text-sm text-gray-500">Writing</p>-->
<!--            <div class="flex gap-2 mt-2">-->
<!--              <button class="text-indigo-600 hover:underline">Edit</button>-->
<!--              <button @click="deleteTest('writing', test.id)" class="text-red-600 hover:underline">Delete</button>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </section>-->
<!--    </div>-->

<!--    &lt;!&ndash; Add Test Modal &ndash;&gt;-->
<!--    <AddTestModal-->
<!--        v-if="showAddTestModal"-->
<!--        @close="showAddTestModal = false"-->
<!--        @test-added="handleTestAdded"-->
<!--    />-->
<!--  </div>-->
<!--</template>-->


<script setup lang="ts">
import { ref, onMounted, watch, shallowRef, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import AddTestModal from "@/components/modals/AddTestModal.vue";
import CButton from "@/components/forms/CButton.vue";
import UpdateTestModal from "@/components/UpdateTestModal.vue";
import UploadTest from "@/components/UploadTest.vue";

type TestType = 'listening' | 'reading' | 'writing'

const loading = ref(true)
const showAddTestModal = ref(false)

// ✅ Update modal states
const showUpdateTestModal = ref(false)
const activeType = ref<TestType | null>(null)
const selectedTest = ref<any | null>(null)
const showUpdateModal = ref(false);
// ✅ dynamic component (сейчас один UpdateTestModal, позже можешь подменять)
const editorComponent = shallowRef<any>(UpdateTestModal)

const students = ref<any[]>([])
const listeningTests = ref<any[]>([])
const readingTests = ref<any[]>([])
const writingTests = ref<any[]>([])

// Load students with results
const loadStudents = async () => {
  const { data } = await supabase
      .from('profiles')
      .select(`
      id,
      full_name,
      role,
      student_tests (
        id,
        listening_score,
        reading_score,
        writing_score,
        speaking_score,
        overall_band
      )
    `)
      .eq('role', 'student')

  students.value = data || []
}

// Load all tests
const loadTests = async () => {
  const { data: lData } = await supabase
      .from('listening_tests')
      .select('*')
      .order('created_at', { ascending: false })
  listeningTests.value = lData || []

  const { data: rData } = await supabase
      .from('reading_tests')
      .select('*')
      .order('created_at', { ascending: false })
  readingTests.value = rData || []

  const { data: wData } = await supabase
      .from('writing_tests')
      .select('*')
      .order('created_at', { ascending: false })
  writingTests.value = wData || []
}

// Delete student results
const clearResults = async (studentTestId: string) => {
  if (!studentTestId) return
  if (!confirm('Delete all results for this student?')) return

  await supabase.from('student_tests').delete().eq('id', studentTestId)
  loadStudents()
}

// Delete test
const deleteTest = async (type: TestType, testId: string) => {
  if (!confirm('Delete test permanently?')) return

  await supabase.from(type + '_tests').delete().eq('id', testId)
  loadTests()
}

// ✅ Open edit modal
const openEdit = (type: TestType, test: any) => {
  console.log("OPEN EDIT:", type, test?.id); // ✅ проверка
  activeType.value = type;
  selectedTest.value = JSON.parse(JSON.stringify(test)); // копия
  showUpdateModal.value = true;
};

const closeEdit = () => {
  showUpdateModal.value = false;
  selectedTest.value = null;
};

// ✅ Save updated test -> Supabase update
const handleTestUpdated = async (updatedTest: any) => {
  if (!activeType.value || !updatedTest?.id) return

  // ❗️Важно: чтобы не отправить лишние поля, уберём created_at и т.п. (если есть)
  const payload = { ...updatedTest }
  delete payload.created_at
  delete payload.updated_at

  const { error } = await supabase
      .from(activeType.value + '_tests')
      .update(payload)
      .eq('id', updatedTest.id)

  if (error) {
    console.error(error)
    alert('Update error: ' + error.message)
    return
  }

  await loadTests()
  closeEdit()
}

onMounted(async () => {
  await loadStudents()
  await loadTests()
  loading.value = false
})

// Reload after adding test
const handleTestAdded = () => {
  showAddTestModal.value = false
  loadTests()
}

// ✅ lock scroll for BOTH modals
watch([showAddTestModal, showUpdateTestModal], ([addOpen, updateOpen]) => {
  const anyOpen = addOpen || updateOpen
  document.body.style.overflowY = anyOpen ? 'hidden' : 'auto'
})

const handleTextSizeChange = (size: any) => {
  console.log('Text size changed to:', size)
}
</script>
<template>
  <div class="min-h-screen bg-gray-50 px-8 py-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">Teacher Panel</h1>

      <!-- Students Results -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">Students Results</h2>

        <div class="overflow-x-auto border rounded-lg border-blue-500/70">
          <table class="min-w-full text-sm">
            <thead class="bg-blue-500/20 backdrop-blur-xl">
            <tr class="text-blue-900">
              <th class="p-3">Student</th>
              <th class="p-3">Listening</th>
              <th class="p-3">Reading</th>
              <th class="p-3">Writing</th>
              <th class="p-3">Speaking</th>
              <th class="p-3">Overall</th>
              <th class="p-3"></th>
            </tr>
            </thead>

            <tbody>
            <tr v-for="student in students" :key="student.id" class="border-t">
              <td class="p-3 font-medium">{{ student.full_name }}</td>
              <td class="p-3 text-center">{{ student.student_tests?.listening_score ?? '-' }}</td>
              <td class="p-3 text-center">{{ student.student_tests?.reading_score ?? '-' }}</td>
              <td class="p-3 text-center">{{ student.student_tests?.writing_score ?? '-' }}</td>
              <td class="p-3 text-center">{{ student.student_tests?.speaking_score ?? '-' }}</td>
              <td class="p-3 text-center font-semibold">{{ student.student_tests?.overall_band ?? '-' }}</td>
              <td class="p-3 text-right">
                <button
                    @click="clearResults(student.student_tests?.id)"
                    class="text-red-600 hover:underline"
                >
                  Clear
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Tests Management -->
      <section>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-semibold">Tests Management</h2>
          <CButton
              @click="showAddTestModal = true"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              text="+ Add Test"
              variant="primary"
              size="medium"
          />
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <!-- Listening -->
          <div v-for="test in listeningTests" :key="test.id" class="bg-white p-4 rounded shadow">
            <h3 class="font-medium">{{ test.title }}</h3>
            <p class="text-sm text-gray-500">Listening</p>
            <div class="flex gap-2 mt-2">
              <button class="text-indigo-600 hover:underline" @click="openEdit('listening', test)">
                Edit
              </button>
              <button @click="deleteTest('listening', test.id)" class="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>

          <!-- Reading -->
          <div v-for="test in readingTests" :key="test.id" class="bg-white p-4 rounded shadow">
            <h3 class="font-medium">{{ test.title }}</h3>
            <p class="text-sm text-gray-500">Reading</p>
            <div class="flex gap-2 mt-2">
              <button class="text-indigo-600 hover:underline" @click="openEdit('reading', test)">
                Edit
              </button>
              <button @click="deleteTest('reading', test.id)" class="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>

          <!-- Writing -->
          <div v-for="test in writingTests" :key="test.id" class="bg-white p-4 rounded shadow">
            <h3 class="font-medium">{{ test.title }}</h3>
            <p class="text-sm text-gray-500">Writing</p>
            <div class="flex gap-2 mt-2">
              <button class="text-indigo-600 hover:underline" @click="openEdit('writing', test)">
                Edit
              </button>
              <button @click="deleteTest('writing', test.id)" class="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Add Test Modal -->
    <AddTestModal
        v-if="showAddTestModal"
        @close="showAddTestModal = false"
        @test-added="handleTestAdded"
    />

    <!-- ✅ Update Test Dynamic Modal -->
    <UpdateTestModal
        v-if="showUpdateModal && selectedTest"
        :type="activeType"
        :test="selectedTest"
        @close="closeEdit"
        @save="handleTestUpdated"
    />

  </div>
</template>
