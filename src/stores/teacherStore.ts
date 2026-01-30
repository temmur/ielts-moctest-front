import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";

export type TestType = "listening" | "reading" | "writing";

export const useTeacherStore = defineStore("teacher", () => {
    const loading = ref(false);

    const students = ref<any[]>([]);
    const listeningTests = ref<any[]>([]);
    const readingTests = ref<any[]>([]);
    const writingTests = ref<any[]>([]);

    // Helpers
    const testTableByType = (type: TestType) => `${type}_tests`;

    // ✅ Load students + latest attempt
    const loadStudents = async () => {
        loading.value = true;

        const { data, error } = await supabase
            .from("profiles")
            .select(
                `
        id,
        full_name,
        role,
        student_tests (
          id,
          student_id,
          status,
          listening_started_at,
          listening_finished_at,
          reading_started_at,
          reading_finished_at,
          writing_started_at,
          writing_finished_at,
          created_at
        )
      `
            )
            .eq("role", "student")
            .order("created_at", { foreignTable: "student_tests", ascending: false })
            .limit(1, { foreignTable: "student_tests" });

        loading.value = false;

        if (error) {
            console.error("loadStudents error:", error);
            students.value = [];
            return;
        }

        students.value = data || [];
    };
    const createStudentAuth = async (payload: { email: string; password: string; full_name: string }) => {
        const { data, error } = await supabase.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: {
                data: { full_name: payload.full_name, role: "student" },
            },
        });

        if (error) throw error;

        // Если profiles НЕ создаётся автоматически триггером — создадим вручную:
        const userId = data.user?.id;
        if (userId) {
            const { error: pErr } = await supabase.from("profiles").upsert({
                id: userId,
                full_name: payload.full_name,
                role: "student",
            });
            if (pErr) throw pErr;
        }

        await loadStudents();
        return data;
    };

    // ✅ Load all tests
    const loadTests = async () => {
        loading.value = true;

        const [{ data: lData, error: lErr }, { data: rData, error: rErr }, { data: wData, error: wErr }] =
            await Promise.all([
                supabase.from("listening_tests").select("*").order("created_at", { ascending: false }),
                supabase.from("reading_tests").select("*").order("created_at", { ascending: false }),
                supabase.from("writing_tests").select("*").order("created_at", { ascending: false }),
            ]);

        loading.value = false;

        if (lErr || rErr || wErr) {
            console.error("loadTests error:", lErr || rErr || wErr);
            return;
        }

        listeningTests.value = lData || [];
        readingTests.value = rData || [];
        writingTests.value = wData || [];
    };

    // ✅ delete ALL results for a student
    const deleteAllResults = async (studentId: string) => {
        const { error } = await supabase.from("student_tests").delete().eq("student_id", studentId);

        if (error) {
            console.error("deleteAllResults error:", error);
            throw error;
        }

        await loadStudents();
    };

    // ✅ delete one attempt by attemptId
    const deleteOneAttempt = async (attemptId: string) => {
        const { error } = await supabase.from("student_tests").delete().eq("id", attemptId);

        if (error) {
            console.error("deleteOneAttempt error:", error);
            throw error;
        }

        await loadStudents();
    };

    // ✅ delete test
    const deleteTest = async (type: TestType, testId: string) => {
        const table = testTableByType(type);
        const { error } = await supabase.from(table).delete().eq("id", testId);

        if (error) {
            console.error("deleteTest error:", error);
            throw error;
        }

        await loadTests();
    };

    // ✅ update test (редактирование)
    const updateTest = async (type: TestType, updatedTest: any) => {
        const table = testTableByType(type);

        const payload = { ...updatedTest };
        delete payload.id; // id не обновляем

        const { error } = await supabase.from(table).update(payload).eq("id", updatedTest.id);

        if (error) {
            console.error("updateTest error:", error);
            throw error;
        }

        await loadTests();
    };

    // ✅ create new attempt (student starts test)
    const createStudentTestAttempt = async (studentId: string, initialStatus = "in_progress") => {
        const { data, error } = await supabase
            .from("student_tests")
            .insert({
                student_id: studentId,
                status: initialStatus,
                listening_started_at: new Date().toISOString(), // или null, как хочешь
            })
            .select()
            .single();

        if (error) {
            console.error("createStudentTestAttempt error:", error);
            throw error;
        }

        await loadStudents();
        return data;
    };

    // Useful computed
    const latestAttemptByStudentId = computed(() => {
        const map = new Map<string, any>();
        for (const s of students.value) {
            const latest = s?.student_tests?.[0] || null;
            map.set(s.id, latest);
        }
        return map;
    });

    return {
        loading,
        students,
        listeningTests,
        readingTests,
        writingTests,
        latestAttemptByStudentId,

        createStudentAuth,
        loadStudents,
        loadTests,
        deleteAllResults,
        deleteOneAttempt,
        deleteTest,
        updateTest,
        createStudentTestAttempt,
    };
});
