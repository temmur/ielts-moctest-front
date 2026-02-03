<!--<template>-->
<!--  <div class="min-h-screen bg-white flex items-center justify-center">-->
<!--    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">-->

<!--      &lt;!&ndash; Loading &ndash;&gt;-->
<!--      <div v-if="loading" class="text-center">-->
<!--        <p class="text-gray-500">Загрузка теста...</p>-->
<!--      </div>-->

<!--      &lt;!&ndash; No test &ndash;&gt;-->
<!--      <div v-else-if="!test" class="text-center space-y-4">-->
<!--        <h2 class="text-xl font-semibold text-gray-900">-->
<!--          Тест не назначен-->
<!--        </h2>-->

<!--        <p class="text-gray-500 text-sm">-->
<!--          Пожалуйста, ожидайте инструкций преподавателя-->
<!--        </p>-->

<!--        <button-->
<!--            @click="logout"-->
<!--            class="w-full mt-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition"-->
<!--        >-->
<!--          Logout-->
<!--        </button>-->
<!--      </div>-->

<!--      &lt;!&ndash; Dashboard &ndash;&gt;-->
<!--      <div v-else class="space-y-6">-->
<!--        &lt;!&ndash; Header &ndash;&gt;-->
<!--        <div class="flex items-center justify-between">-->
<!--          <h2 class="text-xl font-semibold text-gray-900">-->
<!--            Student Dashboard-->
<!--          </h2>-->

<!--          <span-->
<!--              class="px-3 py-1 rounded-full text-xs font-semibold-->
<!--                   bg-indigo-50 text-indigo-600"-->
<!--          >-->
<!--            {{ test.status.toUpperCase() }}-->
<!--          </span>-->
<!--        </div>-->

<!--        <p class="text-sm text-gray-500">-->
<!--          Нажмите кнопку ниже, чтобы начать текущий этап теста-->
<!--        </p>-->

<!--        &lt;!&ndash; Actions &ndash;&gt;-->
<!--        <div class="space-y-3">-->
<!--          <button-->
<!--              v-if="test.status === 'listening'"-->
<!--              @click="startListening"-->
<!--              class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700-->
<!--                   text-white font-semibold transition"-->
<!--          >-->
<!--            Начать Listening-->
<!--          </button>-->

<!--          <button-->
<!--              v-if="test.status === 'reading'"-->
<!--              @click="startReading"-->
<!--              class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700-->
<!--                   text-white font-semibold transition"-->
<!--          >-->
<!--            Начать Reading-->
<!--          </button>-->

<!--          <button-->
<!--              v-if="test.status === 'writing'"-->
<!--              @click="startWriting"-->
<!--              class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700-->
<!--                   text-white font-semibold transition"-->
<!--          >-->
<!--            Начать Writing-->
<!--          </button>-->
<!--        </div>-->

<!--        &lt;!&ndash; Footer &ndash;&gt;-->
<!--        <div class="pt-4 border-t">-->
<!--          <button-->
<!--              @click="logout"-->
<!--              class="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100-->
<!--                   text-red-600 font-medium transition"-->
<!--          >-->
<!--            Logout-->
<!--          </button>-->
<!--        </div>-->
<!--      </div>-->

<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { ref, onMounted } from 'vue'-->
<!--import { useRouter } from 'vue-router'-->
<!--import { supabase } from '@/lib/supabase'-->
<!--import { useAuth } from '@/composables/useAuth'-->

<!--const router = useRouter()-->
<!--const { logout } = useAuth()-->

<!--const test = ref<any>(null)-->
<!--const loading = ref(true)-->

<!--onMounted(async () => {-->
<!--  const {-->
<!--    data: { session }-->
<!--  } = await supabase.auth.getSession()-->

<!--  if (!session) {-->
<!--    router.push('/login')-->
<!--    return-->
<!--  }-->

<!--  const { data, error } = await supabase-->
<!--      .from('student_tests')-->
<!--      .select('*')-->
<!--      .eq('student_id', session.user.id)-->
<!--      .single()-->

<!--  if (error) {-->
<!--    console.warn('Тест не найден')-->
<!--  } else {-->
<!--    test.value = data-->
<!--  }-->

<!--  loading.value = false-->
<!--})-->

<!--const startListening = () => {-->
<!--  router.push(`/test/listening/${test.value.id}`)-->
<!--}-->

<!--const startReading = () => {-->
<!--  router.push(`/test/reading/${test.value.id}`)-->
<!--}-->

<!--const startWriting = () => {-->
<!--  router.push(`/test/writing/${test.value.id}`)-->
<!--}-->
<!--</script>-->






<!--<template>-->
<!--  <div class="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white flex items-center justify-center p-4">-->
<!--    <div class="w-full max-w-md rounded-3xl border bg-white shadow-xl overflow-hidden">-->
<!--      &lt;!&ndash; Top bar &ndash;&gt;-->
<!--      <div class="px-6 py-5 border-b bg-white">-->
<!--        <div class="flex items-center justify-between">-->
<!--          <div>-->
<!--            <h2 class="text-xl font-bold text-gray-900">Student Dashboard</h2>-->
<!--            <p class="text-xs text-gray-500 mt-1">Your IELTS mock progress</p>-->
<!--          </div>-->

<!--          <span-->
<!--              v-if="test"-->
<!--              class="px-3 py-1 rounded-full text-xs font-bold"-->
<!--              :class="badgeClass"-->
<!--          >-->
<!--            {{ test.status.toUpperCase() }}-->
<!--          </span>-->
<!--        </div>-->
<!--      </div>-->

<!--      <div class="p-6">-->
<!--        &lt;!&ndash; Loading &ndash;&gt;-->
<!--        <div v-if="loading" class="space-y-4">-->
<!--          <div class="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>-->
<!--          <div class="h-10 bg-gray-100 rounded-2xl animate-pulse"></div>-->
<!--          <div class="h-10 bg-gray-100 rounded-2xl animate-pulse"></div>-->
<!--          <div class="h-10 bg-gray-100 rounded-2xl animate-pulse"></div>-->
<!--          <p class="text-sm text-gray-500 text-center pt-2">Loading your test...</p>-->
<!--        </div>-->

<!--        &lt;!&ndash; No test available &ndash;&gt;-->
<!--        <div v-else-if="!test" class="text-center space-y-4">-->
<!--          <div class="text-4xl">📝</div>-->
<!--          <h3 class="text-lg font-semibold text-gray-900">Тест не назначен</h3>-->
<!--          <p class="text-gray-500 text-sm">-->
<!--            Убедись, что в базе есть хотя бы 1 Listening, 1 Reading, 1 Writing тест.-->
<!--          </p>-->

<!--          <button-->
<!--              @click="logout"-->
<!--              class="w-full mt-2 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition"-->
<!--          >-->
<!--            Logout-->
<!--          </button>-->
<!--        </div>-->

<!--        &lt;!&ndash; Completed &ndash;&gt;-->
<!--        <div v-else-if="test.status === 'completed'" class="space-y-5">-->
<!--          <div class="rounded-3xl border bg-gradient-to-b from-indigo-50 to-white p-5">-->
<!--            <div class="flex items-start gap-3">-->
<!--              <div class="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">-->
<!--                ✓-->
<!--              </div>-->
<!--              <div>-->
<!--                <h3 class="font-bold text-gray-900">Test completed</h3>-->
<!--                <p class="text-sm text-gray-600">Here are your results:</p>-->
<!--              </div>-->
<!--            </div>-->

<!--            <div class="mt-4 space-y-2">-->
<!--              <div class="flex items-center justify-between rounded-2xl border bg-white px-4 py-3">-->
<!--                <span class="text-sm font-semibold text-gray-700">Listening</span>-->
<!--                <span class="text-sm font-bold text-gray-900">{{ fmt(test.listening_score) }}</span>-->
<!--              </div>-->
<!--              <div class="flex items-center justify-between rounded-2xl border bg-white px-4 py-3">-->
<!--                <span class="text-sm font-semibold text-gray-700">Reading</span>-->
<!--                <span class="text-sm font-bold text-gray-900">{{ fmt(test.reading_score) }}</span>-->
<!--              </div>-->
<!--              <div class="flex items-center justify-between rounded-2xl border bg-white px-4 py-3">-->
<!--                <span class="text-sm font-semibold text-gray-700">Writing</span>-->
<!--                <span class="text-sm font-bold text-gray-900">{{ fmt(test.writing_score) }}</span>-->
<!--              </div>-->

<!--              <div class="flex items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">-->
<!--                <span class="text-sm font-extrabold text-indigo-900">Total</span>-->
<!--                <span class="text-sm font-extrabold text-indigo-900">{{ fmt(test.total_score) }}</span>-->
<!--              </div>-->
<!--            </div>-->

<!--            <button-->
<!--                class="w-full mt-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition"-->
<!--                @click="goResult"-->
<!--            >-->
<!--              View details-->
<!--            </button>-->
<!--          </div>-->

<!--          <button-->
<!--              @click="logout"-->
<!--              class="w-full py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-bold transition"-->
<!--          >-->
<!--            Logout-->
<!--          </button>-->
<!--        </div>-->

<!--        &lt;!&ndash; In progress &ndash;&gt;-->
<!--        <div v-else class="space-y-5">-->
<!--          <div class="rounded-3xl border bg-gray-50 p-4">-->
<!--            <p class="text-sm text-gray-600">-->
<!--              Нажми кнопку, чтобы начать текущий этап. Следующий этап откроется только после завершения текущего.-->
<!--            </p>-->
<!--          </div>-->

<!--          <div class="space-y-3">-->
<!--            <button-->
<!--                v-if="test.status === 'listening'"-->
<!--                @click="startListening"-->
<!--                class="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-95-->
<!--                     text-white font-extrabold transition shadow"-->
<!--            >-->
<!--              Start Listening-->
<!--            </button>-->

<!--            <button-->
<!--                v-if="test.status === 'reading'"-->
<!--                @click="startReading"-->
<!--                class="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-95-->
<!--                     text-white font-extrabold transition shadow"-->
<!--            >-->
<!--              Start Reading-->
<!--            </button>-->

<!--            <button-->
<!--                v-if="test.status === 'writing'"-->
<!--                @click="startWriting"-->
<!--                class="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-95-->
<!--                     text-white font-extrabold transition shadow"-->
<!--            >-->
<!--              Start Writing-->
<!--            </button>-->
<!--          </div>-->

<!--          <div class="pt-4 border-t">-->
<!--            <button-->
<!--                @click="logout"-->
<!--                class="w-full py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-bold transition"-->
<!--            >-->
<!--              Logout-->
<!--            </button>-->
<!--          </div>-->
<!--        </div>-->

<!--        &lt;!&ndash; local error &ndash;&gt;-->
<!--        <p v-if="localError" class="mt-4 text-xs text-red-600">-->
<!--          {{ localError }}-->
<!--        </p>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { ref, computed, onMounted } from "vue";-->
<!--import { useRouter } from "vue-router";-->
<!--import { supabase } from "@/lib/supabase";-->
<!--import { useAuth } from "@/composables/useAuth";-->
<!--import { studentTestService, type StudentTestRow } from "@/service/studentTestService";-->

<!--const router = useRouter();-->
<!--const { logout } = useAuth();-->

<!--const test = ref<StudentTestRow | null>(null);-->
<!--const loading = ref(true);-->
<!--const localError = ref("");-->

<!--const badgeClass = computed(() => {-->
<!--  const s = test.value?.status;-->
<!--  if (s === "listening") return "bg-blue-50 text-blue-700 border border-blue-100";-->
<!--  if (s === "reading") return "bg-amber-50 text-amber-700 border border-amber-100";-->
<!--  if (s === "writing") return "bg-purple-50 text-purple-700 border border-purple-100";-->
<!--  if (s === "completed") return "bg-emerald-50 text-emerald-700 border border-emerald-100";-->
<!--  return "bg-gray-100 text-gray-700";-->
<!--});-->

<!--const fmt = (v: any) => (v === null || typeof v === "undefined" ? "—" : String(v));-->

<!--onMounted(async () => {-->
<!--  try {-->
<!--    const { data } = await supabase.auth.getSession();-->
<!--    const session = data.session;-->

<!--    if (!session) {-->
<!--      router.push("/login");-->
<!--      return;-->
<!--    }-->

<!--    // ✅ назначаем рандомные тесты, если записи нет-->
<!--    test.value = await studentTestService.assignIfMissing(session.user.id);-->
<!--  } catch (e: any) {-->
<!--    console.error(e);-->
<!--    localError.value = e?.message || "Failed to load student test";-->
<!--  } finally {-->
<!--    loading.value = false;-->
<!--  }-->
<!--});-->

<!--const startListening = () => router.push("/test/listening");-->
<!--const startReading = () => router.push("/test/reading");-->
<!--const startWriting = () => router.push("/test/writing");-->
<!--const goResult = () => router.push("/test/result");-->
<!--</script>-->

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white flex items-center justify-center p-4">
    <div class="w-full max-w-md rounded-3xl border bg-white shadow-xl overflow-hidden">

      <!-- Header -->
      <div class="p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div class="text-xs opacity-90">Student Dashboard</div>
        <div class="text-2xl font-extrabold mt-1">Your IELTS mock progress</div>
        <div class="text-xs opacity-90 mt-2">You must complete Listening → Reading → Writing</div>
      </div>

      <!-- Body -->
      <div class="p-6">
        <!-- Loading -->
        <div v-if="loading" class="space-y-4">
          <div class="h-10 bg-gray-100 rounded-2xl animate-pulse"></div>
          <div class="h-10 bg-gray-100 rounded-2xl animate-pulse"></div>
          <div class="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
          <div class="text-center text-sm text-gray-500">Loading...</div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div class="font-bold mb-1">Error</div>
          <div class="text-sm">{{ error }}</div>
          <button
              @click="init"
              class="mt-4 w-full py-2.5 rounded-2xl bg-white border hover:bg-gray-50 font-semibold text-gray-900"
          >
            Retry
          </button>
        </div>

        <!-- No test -->
        <div v-else-if="!studentTest" class="text-center space-y-4">
          <div class="text-4xl">📝</div>
          <h2 class="text-xl font-extrabold text-gray-900">Тест не назначен</h2>
          <p class="text-gray-500 text-sm">
            Убедись, что в базе есть хотя бы 1 Listening, 1 Reading, 1 Writing тест.
          </p>

          <button
              @click="logout"
              class="w-full mt-6 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition"
          >
            Logout
          </button>
        </div>

        <!-- Dashboard -->
        <div v-else class="space-y-5">
          <!-- Status badge -->
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-gray-500">Current stage</div>
              <div class="text-lg font-extrabold text-gray-900">
                {{ stageTitle(studentTest.status) }}
              </div>
            </div>

            <span
                class="px-3 py-1 rounded-full text-xs font-extrabold border"
                :class="statusPillClass(studentTest.status)"
            >
              {{ String(studentTest.status).toUpperCase() }}
            </span>
          </div>

          <p class="text-sm text-gray-500">
            Нажмите кнопку ниже, чтобы начать текущий этап теста.
          </p>

          <!-- Actions -->
          <div class="space-y-3">
            <button
                v-if="studentTest.status === 'listening'"
                @click="startListening"
                class="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold transition"
            >
              Start Listening
            </button>

            <button
                v-if="studentTest.status === 'reading'"
                @click="startReading"
                class="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold transition"
            >
              Start Reading
            </button>

            <button
                v-if="studentTest.status === 'writing'"
                @click="startWriting"
                class="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold transition"
            >
              Start Writing
            </button>

            <button
                v-if="studentTest.status === 'completed'"
                @click="router.push('/results')"
                class="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold transition"
            >
              View Results
            </button>
          </div>

          <!-- Footer -->
          <div class="pt-4 border-t">
            <button
                @click="logout"
                class="w-full py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/composables/useAuth";
import { studentTestService } from "@/service/studentTestService";

const router = useRouter();
const { logout } = useAuth();

const loading = ref(true);
const error = ref("");
const studentTest = ref<any>(null);

const stageTitle = (s: string) => {
  if (s === "listening") return "Listening";
  if (s === "reading") return "Reading";
  if (s === "writing") return "Writing";
  if (s === "completed") return "Completed";
  return "—";
};

const statusPillClass = (s: string) => {
  if (s === "listening") return "bg-indigo-50 text-indigo-700 border-indigo-100";
  if (s === "reading") return "bg-amber-50 text-amber-700 border-amber-100";
  if (s === "writing") return "bg-purple-50 text-purple-700 border-purple-100";
  if (s === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  return "bg-gray-50 text-gray-700 border-gray-100";
};

async function init() {
  loading.value = true;
  error.value = "";

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    // ✅ Единственный источник правды
    studentTest.value = await studentTestService.getOrAssignStudentTest(session.user.id);
  } catch (e: any) {
    console.error(e);
    error.value = e?.message || "Failed to load dashboard";
    studentTest.value = null;
  } finally {
    loading.value = false;
  }
}

init();

// ✅ ВАЖНО: используем studentTest, не test.value
const startListening = () => {
  router.push(`/test/listening?studentTestId=${studentTest.value.id}&testId=${studentTest.value.listening_test_id}`);
};

const startReading = () => {
  router.push(`/test/reading?studentTestId=${studentTest.value.id}&testId=${studentTest.value.reading_test_id}`);
};

const startWriting = () => {
  router.push(`/test/writing?studentTestId=${studentTest.value.id}&testId=${studentTest.value.writing_test_id}`);
};
</script>
