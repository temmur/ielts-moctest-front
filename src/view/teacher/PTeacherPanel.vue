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
import { ref, onMounted, watch } from "vue";
import AddTestModal from "@/components/modals/AddTestModal.vue";
import CButton from "@/components/forms/CButton.vue";
import UpdateTestModal from "@/components/UpdateTestModal.vue";
import { useTeacherStore } from "@/stores/teacherStore";
import { testService } from "@/service/testService";

const saving = ref(false);

type TestType = "listening" | "reading" | "writing";
const query = ref("");
const statusFilter = ref<"all" | "not_started" | "listening" | "reading" | "writing" | "finished">("all");

const filteredStudents = () => {
  const q = query.value.trim().toLowerCase();
  return teacher.students.filter((s: any) => {
    const attempt = latestAttempt(s);
    const matchesQuery =
        !q ||
        (s.full_name || "").toLowerCase().includes(q) ||
        (s.id || "").toLowerCase().includes(q);

    const matchesStatus =
        statusFilter.value === "all" ||
        (attempt?.status || "not_started") === statusFilter.value;

    return matchesQuery && matchesStatus;
  });
};
const teacher = useTeacherStore();

const showAddTestModal = ref(false);

// ✅ Edit modal state
const showUpdateModal = ref(false);
const activeType = ref<TestType | null>(null);
const selectedTest = ref<any | null>(null);

// Helpers (UI)
const latestAttempt = (student: any) => student?.student_tests?.[0] ?? null;

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
};

const getStageBadge = (started?: string | null, finished?: string | null) => {
  if (finished) return { text: "Finished", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };
  if (started) return { text: "In progress", cls: "bg-amber-100 text-amber-700 border-amber-200" };
  return { text: "Not started", cls: "bg-gray-100 text-gray-600 border-gray-200" };
};

// Actions
const openEdit = (type: TestType, test: any) => {
  activeType.value = type;
  selectedTest.value = JSON.parse(JSON.stringify(test));
  showUpdateModal.value = true;
};

const closeEdit = () => {
  showUpdateModal.value = false;
  activeType.value = null;
  selectedTest.value = null;
};

const handleTestUpdated = async (updatedTest: any) => {
  if (!activeType.value) return;
  try {
    await teacher.updateTest(activeType.value, updatedTest);
    closeEdit();
  } catch (e: any) {
    alert(e?.message || "Update failed");
  }
};

const handleTestAdded = async () => {
  showAddTestModal.value = false;
  await teacher.loadTests();
};

// Confirm wrappers (чтобы UX был одинаковый)
const confirmDeleteTest = async (type: TestType, testId: string) => {
  if (!confirm("Delete test permanently?")) return;
  try {
    await teacher.deleteTest(type, testId);
  } catch (e: any) {
    alert(e?.message || "Delete failed");
  }
};

const confirmDeleteLatest = async (attemptId?: string) => {
  if (!attemptId) return;
  if (!confirm("Delete latest attempt only?")) return;
  try {
    await teacher.deleteOneAttempt(attemptId);
  } catch (e: any) {
    alert(e?.message || "Delete failed");
  }
};

const confirmDeleteAll = async (studentId: string) => {
  if (!confirm("Delete ALL results for this student?")) return;
  try {
    await teacher.deleteAllResults(studentId);
  } catch (e: any) {
    alert(e?.message || "Delete failed");
  }
};
const onSave = async (payload) => {
  saving.value = true;
  try {
    await testService.updateFullTest(payload); // ✅ одна функция под reading/listening
    alert("Updated successfully!");
    showUpdateModal.value = false;
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await teacher.loadStudents();
  await teacher.loadTests();
});

// lock scroll for BOTH modals
watch([showAddTestModal, showUpdateModal], ([addOpen, editOpen]) => {
  document.body.style.overflowY = addOpen || editOpen ? "hidden" : "auto";
});
</script>

<template>
  <div class="min-h-screen text-gray-900 bg-black/40">
    <!-- Background: aurora + grid -->
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-[radial-gradient(1100px_circle_at_12%_-10%,rgba(99,102,241,.45),transparent_45%),radial-gradient(900px_circle_at_90%_0%,rgba(16,185,129,.35),transparent_45%),radial-gradient(800px_circle_at_60%_110%,rgba(236,72,153,.25),transparent_40%)]"></div>
      <div class="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:42px_42px]"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#070A12]/40 to-[#070A12]"></div>
    </div>

    <div class="max-w-7xl mx-auto px-5 sm:px-6 py-7 sm:py-10">
      <!-- Floating Top Bar -->
      <div class="lg:sticky top-4 z-30 ">
        <div class="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,.45)]">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 sm:p-5">
            <div class="flex items-start gap-4">
              <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/50 to-emerald-500/35 border border-white/10 shadow-[0_10px_40px_rgba(99,102,241,.15)]"></div>
              <div>
                <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Live dashboard
                </div>
                <h1 class="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Teacher Panel
                </h1>
                <p class="text-sm text-white/60 mt-1">
                  Students progress + IELTS tests management
                </p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                  class="rounded-2xl px-4 py-2 text-sm font-semibold text-white/90 border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.99] transition shadow-sm"
                  @click="teacher.loadStudents()"
              >
                Refresh students
              </button>

              <button
                  class="rounded-2xl px-4 py-2 text-sm font-semibold text-white/90 border border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.99] transition shadow-sm"
                  @click="teacher.loadTests()"
              >
                Refresh tests
              </button>

              <div class="h-9 w-px bg-white/10 mx-1 hidden sm:block"></div>

              <!-- Keep your component -->
              <CButton
                  @click="showAddTestModal = true"
                  text="+ Add Test"
                  variant="primary"
                  size="medium"
                  class="px-5 py-2 rounded-2xl shadow-sm"
              />
            </div>
          </div>

          <!-- KPI strip -->
          <div class="border-t border-white/10 px-4 sm:px-5 py-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div class="text-xs text-white/60">Students</div>
                <div class="mt-1 text-2xl font-extrabold text-white">{{ teacher.students.length }}</div>
                <div class="mt-1 text-xs text-white/50">Total in profiles</div>
              </div>

              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div class="text-xs text-white/60">Total tests</div>
                <div class="mt-1 text-2xl font-extrabold text-white">
                  {{ teacher.listeningTests.length + teacher.readingTests.length + teacher.writingTests.length }}
                </div>
                <div class="mt-1 text-xs text-white/50">All sections</div>
              </div>

              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div class="text-xs text-white/60">Active attempts</div>
                <div class="mt-1 text-2xl font-extrabold text-white">
                  {{
                    teacher.students.filter(s => {
                      const a = latestAttempt(s);
                      return a?.status && a.status !== 'finished' && a.status !== 'not_started';
                    }).length
                  }}
                </div>
                <div class="mt-1 text-xs text-white/50">In progress</div>
              </div>

              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div class="text-xs text-white/60">Sync</div>
                <div class="mt-1 text-2xl font-extrabold" :class="teacher.loading ? 'text-amber-300' : 'text-emerald-300'">
                  {{ teacher.loading ? 'Loading' : 'Ready' }}
                </div>
                <div class="mt-1 text-xs text-white/50">Data state</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Students Panel -->
      <section class="mt-8">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-4">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-white">Students</h2>
            <p class="text-sm text-white/55">Latest attempt per student • reset results anytime</p>
          </div>

          <!-- Search + Filter -->
          <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div class="relative flex items-center">
              <div class="absolute inset-y-0 left-3 flex items-center text-white/40 text-2xl">⌕</div>
              <input
                  v-model="query"
                  placeholder="Search by name or id..."
                  class="w-full sm:w-[320px] rounded-2xl border border-white/10 bg-white/5 px-9 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
            </div>

            <select
                v-model="statusFilter"
                class="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-400/40"
            >
              <option value="all">All statuses</option>
              <option value="not_started">not_started</option>
              <option value="listening">listening</option>
              <option value="reading">reading</option>
              <option value="writing">writing</option>
              <option value="finished">finished</option>
            </select>
          </div>
        </div>

        <!-- Table shell -->
        <div class="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,.5)] overflow-hidden">
          <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div class="text-sm text-white/60">
              Showing <span class="font-semibold text-white">{{ filteredStudents().length }}</span> of
              <span class="font-semibold text-white">{{ teacher.students.length }}</span>
            </div>

            <div v-if="teacher.loading" class="text-xs text-white/60">
              <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <span class="h-2 w-2 rounded-full bg-amber-300 animate-pulse"></span>
                Syncing…
              </span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="top-[92px] sm:top-[110px] z-20 bg-[#0b1020]/80 backdrop-blur border-b border-white/10">
              <tr class="text-white/60">
                <th class="p-4 text-left font-semibold">Student</th>
                <th class="p-4 text-center font-semibold">Status</th>
                <th class="p-4 text-center font-semibold">Listening</th>
                <th class="p-4 text-center font-semibold">Reading</th>
                <th class="p-4 text-center font-semibold">Writing</th>
                <th class="p-4 text-left font-semibold">Latest</th>
                <th class="p-4 text-right font-semibold">Actions</th>
              </tr>
              </thead>

              <tbody v-if="filteredStudents().length">
              <tr
                  v-for="student in filteredStudents()"
                  :key="student.id"
                  class="border-b border-white/10 hover:bg-white/5 transition"
              >
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5"></div>
                    <div>
                      <div class="font-semibold text-white">{{ student.full_name }}</div>
                      <div class="text-xs text-white/45 font-mono">{{ student.id }}</div>
                    </div>
                  </div>
                </td>

                <!-- No attempt -->
                <template v-if="!latestAttempt(student)">
                  <td class="p-4 text-center" colspan="5">
                      <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        <span class="h-2 w-2 rounded-full bg-white/25"></span>
                        No results yet
                      </span>
                  </td>
                  <td class="p-4 text-right">
                    <button
                        class="rounded-2xl px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-500/90 to-rose-500/90 shadow-[0_12px_50px_rgba(244,63,94,.25)] hover:opacity-95 active:scale-[0.99] transition"
                        @click="confirmDeleteAll(student.id)"
                    >
                      Reset
                    </button>
                  </td>
                </template>

                <!-- Has attempt -->
                <template v-else>
                  <td class="p-4 text-center">
                      <span class="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/85">
                        {{ latestAttempt(student)?.status ?? "—" }}
                      </span>
                  </td>

                  <td class="p-4 text-center">
                      <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold"
                            :class="getStageBadge(latestAttempt(student)?.listening_started_at, latestAttempt(student)?.listening_finished_at).cls + ' border-white/10 bg-white/5'"
                      >
                        {{ getStageBadge(latestAttempt(student)?.listening_started_at, latestAttempt(student)?.listening_finished_at).text }}
                      </span>
                  </td>

                  <td class="p-4 text-center">
                      <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold"
                            :class="getStageBadge(latestAttempt(student)?.reading_started_at, latestAttempt(student)?.reading_finished_at).cls + ' border-white/10 bg-white/5'"
                      >
                        {{ getStageBadge(latestAttempt(student)?.reading_started_at, latestAttempt(student)?.reading_finished_at).text }}
                      </span>
                  </td>

                  <td class="p-4 text-center">
                      <span class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold"
                            :class="getStageBadge(latestAttempt(student)?.writing_started_at, latestAttempt(student)?.writing_finished_at).cls + ' border-white/10 bg-white/5'"
                      >
                        {{ getStageBadge(latestAttempt(student)?.writing_started_at, latestAttempt(student)?.writing_finished_at).text }}
                      </span>
                  </td>

                  <td class="p-4">
                    <div class="text-sm font-semibold text-white">
                      {{ formatDateTime(latestAttempt(student)?.created_at) }}
                    </div>
                    <div class="text-xs text-white/45 font-mono mt-0.5">
                      {{ latestAttempt(student)?.id }}
                    </div>
                  </td>

                  <td class="p-4 text-right">
                    <button
                        class="rounded-2xl px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-500/90 to-rose-500/90 shadow-[0_12px_50px_rgba(244,63,94,.25)] hover:opacity-95 active:scale-[0.99] transition"
                        @click="confirmDeleteAll(student.id)"
                    >
                      Reset
                    </button>
                  </td>
                </template>
              </tr>
              </tbody>

              <tbody v-else>
              <tr>
                <td colspan="7" class="p-12 text-center">
                  <div class="mx-auto max-w-md">
                    <div class="text-lg font-bold text-white">No matches</div>
                    <div class="text-sm text-white/55 mt-2">
                      Try a different name/id or change the status filter.
                    </div>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Tests -->
      <section class="mt-10">
        <div class="flex items-end justify-between mb-4">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-white">Tests</h2>
            <p class="text-sm text-white/55">Edit and maintain question banks</p>
          </div>

          <div class="text-sm text-white/60">
            Total: <span class="font-semibold text-white">
              {{ teacher.listeningTests.length + teacher.readingTests.length + teacher.writingTests.length }}
            </span>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <!-- Listening -->
          <div class="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,.5)] overflow-hidden">
            <div class="p-5 border-b border-white/10">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-bold text-white">Listening</div>
                  <div class="text-xs text-white/50 mt-1">{{ teacher.listeningTests.length }} tests</div>
                </div>
                <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">Section</span>
              </div>
            </div>

            <div class="p-5">
              <div v-if="teacher.listeningTests.length" class="space-y-3">
                <div v-for="test in teacher.listeningTests" :key="test.id"
                     class="rounded-2xl border my-4 first:mt-0 last:mb-0 border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="font-semibold text-white truncate">{{ test.title }}</div>
                      <div class="text-xs text-white/45 font-mono mt-1 truncate">ID: {{ test.id }}</div>
                    </div>
                    <div class="flex gap-2 shrink-0">
                      <button class="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/85 hover:bg-white/10"
                              @click="openEdit('listening', test)">
                        Edit
                      </button>
                      <button class="rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/15"
                              @click="confirmDeleteTest('listening', test.id)">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="py-10 text-center text-sm text-white/55">
                No listening tests yet.
              </div>
            </div>
          </div>

          <!-- Reading -->
          <div class="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,.5)] overflow-hidden">
            <div class="p-5 border-b border-white/10">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-bold text-white">Reading</div>
                  <div class="text-xs text-white/50 mt-1">{{ teacher.readingTests.length }} tests</div>
                </div>
                <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">Section</span>
              </div>
            </div>

            <div class="p-5">
              <div v-if="teacher.readingTests.length" class="space-y-3">
                <div v-for="test in teacher.readingTests" :key="test.id"
                     class="rounded-2xl border my-4 first:mt-0 last:mb-0 border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="font-semibold text-white truncate">{{ test.title }}</div>
                      <div class="text-xs text-white/45 font-mono mt-1 truncate">ID: {{ test.id }}</div>
                    </div>
                    <div class="flex gap-2 shrink-0">
                      <button class="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/85 hover:bg-white/10"
                              @click="openEdit('reading', test)">
                        Edit
                      </button>
                      <button class="rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/15"
                              @click="confirmDeleteTest('reading', test.id)">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="py-10 text-center text-sm text-white/55">
                No reading tests yet.
              </div>
            </div>
          </div>

          <!-- Writing -->
          <div class="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,.5)] overflow-hidden">
            <div class="p-5 border-b border-white/10">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-bold text-white">Writing</div>
                  <div class="text-xs text-white/50 mt-1">{{ teacher.writingTests.length }} tests</div>
                </div>
                <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">Section</span>
              </div>
            </div>

            <div class="p-5">
              <div v-if="teacher.writingTests.length" class="space-y-3">
                <div v-for="test in teacher.writingTests" :key="test.id"
                     class="rounded-2xl border my-4 first:mt-0 last:mb-0 border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="font-semibold text-white truncate">{{ test.title }}</div>
                      <div class="text-xs text-white/45 font-mono mt-1 truncate">ID: {{ test.id }}</div>
                    </div>
                    <div class="flex gap-2 shrink-0">
                      <button class="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/85 hover:bg-white/10"
                              @click="openEdit('writing', test)">
                        Edit
                      </button>
                      <button class="rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/15"
                              @click="confirmDeleteTest('writing', test.id)">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="py-10 text-center text-sm text-white/55">
                No writing tests yet.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Modals -->
      <AddTestModal
          v-if="showAddTestModal"
          @close="showAddTestModal = false"
          @test-added="handleTestAdded"
      />

<!--      <UpdateTestModal-->
<!--          v-if="showUpdateModal && selectedTest && activeType"-->
<!--          :type="activeType"-->
<!--          :test="selectedTest"-->
<!--          @close="closeEdit"-->
<!--          @save="handleTestUpdated"-->
<!--      />-->
      <UpdateTestModal
          v-if="showUpdateModal"
          :test="selectedTest"
          :type="activeType"
          @close="showUpdateModal=false"
          @save="onSave"
      />
    </div>
  </div>
</template>

