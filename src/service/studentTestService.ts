// // src/service/studentTestService.ts
// import { supabase } from "@/lib/supabase";
//
// export type Stage = "listening" | "reading" | "writing" | "completed";
//
// export type StudentTestRow = {
//     id: string;
//     student_id: string;
//
//     listening_test_id: string | null;
//     reading_test_id: string | null;
//     writing_test_id: string | null;
//
//     status: Stage;
//
//     listening_done: boolean;
//     reading_done: boolean;
//     writing_done: boolean;
//
//     listening_score: number | null;
//     reading_score: number | null;
//     writing_score: number | null;
//     total_score: number | null;
//
//     stage_started_at?: string | null;
//     stage_deadline_at?: string | null;
// };
//
// function pickRandomId(ids: { id: string }[]) {
//     if (!ids?.length) return null;
//     const i = Math.floor(Math.random() * ids.length);
//     return ids[i].id;
// }
//
// export const studentTestService = {
//     async getMyStudentTest(studentId: string): Promise<StudentTestRow | null> {
//         const { data, error } = await supabase
//             .from("student_tests")
//             .select("*")
//             .eq("student_id", studentId)
//             .maybeSingle();
//
//         if (error) throw error;
//         return (data as StudentTestRow) || null;
//     },
//
//     /**
//      * ✅ Если теста нет — назначаем рандомно listening+reading+writing
//      * Делать это лучше 1 раз (при первом заходе на dashboard)
//      */
//     async assignIfMissing(studentId: string): Promise<StudentTestRow | null> {
//         // 1) check existing
//         const existing = await this.getMyStudentTest(studentId);
//         if (existing) return existing;
//
//         // 2) get ids from each tests table
//         const [lRes, rRes, wRes] = await Promise.all([
//             supabase.from("listening_tests").select("id"),
//             supabase.from("reading_tests").select("id"),
//             supabase.from("writing_tests").select("id"),
//         ]);
//
//         if (lRes.error) throw lRes.error;
//         if (rRes.error) throw rRes.error;
//         if (wRes.error) throw wRes.error;
//
//         const listeningId = pickRandomId(lRes.data || []);
//         const readingId = pickRandomId(rRes.data || []);
//         const writingId = pickRandomId(wRes.data || []);
//
//         // если нет тестов в таблицах
//         if (!listeningId || !readingId || !writingId) return null;
//
//         // 3) insert student_tests
//         const payload = {
//             student_id: studentId,
//             listening_test_id: listeningId,
//             reading_test_id: readingId,
//             writing_test_id: writingId,
//
//             status: "listening" as Stage,
//
//             listening_done: false,
//             reading_done: false,
//             writing_done: false,
//
//             listening_score: null,
//             reading_score: null,
//             writing_score: null,
//             total_score: null,
//
//             // опционально: старт этапа
//             // stage_started_at: new Date().toISOString(),
//         };
//
//         const { data, error } = await supabase
//             .from("student_tests")
//             .insert(payload)
//             .select("*")
//             .single();
//
//         if (error) throw error;
//         return data as StudentTestRow;
//     },
//
//     /**
//      * ✅ Проверка доступа к этапу (для router guard)
//      */
//     canEnterStage(row: StudentTestRow, stage: Exclude<Stage, "completed">) {
//         if (!row) return false;
//
//         // completed -> можно только результаты
//         if (row.status === "completed") return stage === "writing" ? false : false;
//
//         // строгая последовательность
//         if (stage === "listening") return row.status === "listening";
//         if (stage === "reading") return row.status === "reading";
//         if (stage === "writing") return row.status === "writing";
//
//         return false;
//     },
//
//     /**
//      * ✅ Перевод на следующий этап
//      * (вызывай после submit listening / reading / writing)
//      */
//     async moveToNextStage(studentTestId: string, current: Exclude<Stage, "completed">) {
//         let next: Stage = "completed";
//         if (current === "listening") next = "reading";
//         if (current === "reading") next = "writing";
//         if (current === "writing") next = "completed";
//
//         const patch: any = { status: next };
//
//         if (current === "listening") patch.listening_done = true;
//         if (current === "reading") patch.reading_done = true;
//         if (current === "writing") patch.writing_done = true;
//
//         // опционально: stage_started_at = now for next stage
//         // patch.stage_started_at = next === "completed" ? null : new Date().toISOString();
//
//         const { data, error } = await supabase
//             .from("student_tests")
//             .update(patch)
//             .eq("id", studentTestId)
//             .select("*")
//             .single();
//
//         if (error) throw error;
//         return data as StudentTestRow;
//     },
//
//     /**
//      * ✅ Сохранение score и total
//      */
//     async saveScores(studentTestId: string, scores: {
//         listening?: number | null;
//         reading?: number | null;
//         writing?: number | null;
//     }) {
//         const patch: any = {};
//
//         if (typeof scores.listening !== "undefined") patch.listening_score = scores.listening;
//         if (typeof scores.reading !== "undefined") patch.reading_score = scores.reading;
//         if (typeof scores.writing !== "undefined") patch.writing_score = scores.writing;
//
//         // посчитать total на клиенте можно так:
//         // total = (listening || 0) + (reading || 0) + (writing || 0)
//         // но правильнее делать это после fetch row
//         const { data: current, error: curErr } = await supabase
//             .from("student_tests")
//             .select("listening_score,reading_score,writing_score")
//             .eq("id", studentTestId)
//             .single();
//
//         if (curErr) throw curErr;
//
//         const L = (typeof scores.listening !== "undefined" ? scores.listening : current.listening_score) ?? 0;
//         const R = (typeof scores.reading !== "undefined" ? scores.reading : current.reading_score) ?? 0;
//         const W = (typeof scores.writing !== "undefined" ? scores.writing : current.writing_score) ?? 0;
//
//         patch.total_score = Number(L) + Number(R) + Number(W);
//
//         const { data, error } = await supabase
//             .from("student_tests")
//             .update(patch)
//             .eq("id", studentTestId)
//             .select("*")
//             .single();
//
//         if (error) throw error;
//         return data as StudentTestRow;
//     },
// };



import { supabase } from "@/supabase";

type Stage = "listening" | "reading" | "writing";

function pickRandom<T>(arr: T[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export const studentTestService = {
    async getOrAssignStudentTest(studentId: string) {
        // 1) пробуем найти student_tests
        const { data: existing, error: exErr } = await supabase
            .from("student_tests")
            .select("*")
            .eq("student_id", studentId)
            .maybeSingle();

        if (exErr) throw exErr;

        // 2) если нет — создаём пустую запись
        let st = existing;
        if (!st) {
            const { data: created, error: createErr } = await supabase
                .from("student_tests")
                .insert({
                    student_id: studentId,
                    status: "listening" as Stage,
                })
                .select()
                .single();

            if (createErr) throw createErr;
            st = created;
        }

        // 3) если тесты уже назначены — просто возвращаем
        const hasAssigned =
            !!st.listening_test_id && !!st.reading_test_id && !!st.writing_test_id;

        if (hasAssigned) return st;

        // 4) берём рандомные тесты
        const [lRes, rRes, wRes] = await Promise.all([
            supabase.from("listening_tests").select("id").limit(200),
            supabase.from("reading_tests").select("id").limit(200),
            supabase.from("writing_tests").select("id").limit(200),
        ]);

        if (lRes.error) throw lRes.error;
        if (rRes.error) throw rRes.error;
        if (wRes.error) throw wRes.error;

        const l = lRes.data || [];
        const r = rRes.data || [];
        const w = wRes.data || [];

        if (!l.length || !r.length || !w.length) {
            throw new Error(
                "Нет тестов в базе: добавь хотя бы 1 Listening, 1 Reading, 1 Writing."
            );
        }

        const listening = pickRandom(l);
        const reading = pickRandom(r);
        const writing = pickRandom(w);

        // 5) сохраняем в student_tests
        const { data: updated, error: upErr } = await supabase
            .from("student_tests")
            .update({
                listening_test_id: listening.id,
                reading_test_id: reading.id,
                writing_test_id: writing.id,
                status: st.status || "listening",
            })
            .eq("id", st.id)
            .select()
            .single();

        if (upErr) throw upErr;

        return updated;
    },

    // helpers для переходов (чтобы статус был строго по порядку)
    async markStageStarted(studentTestId: string, stage: Stage) {
        const field =
            stage === "listening"
                ? "listening_started_at"
                : stage === "reading"
                    ? "reading_started_at"
                    : "writing_started_at";

        const { error } = await supabase
            .from("student_tests")
            .update({ [field]: new Date().toISOString() })
            .eq("id", studentTestId);

        if (error) throw error;
    },

    async markStageFinished(studentTestId: string, stage: Stage) {
        const finishField =
            stage === "listening"
                ? "listening_finished_at"
                : stage === "reading"
                    ? "reading_finished_at"
                    : "writing_finished_at";

        const nextStatus: Stage =
            stage === "listening" ? "reading" : stage === "reading" ? "writing" : "writing";

        const payload: any = { [finishField]: new Date().toISOString() };

        // если finishing listening/reading -> обновляем status на следующий
        if (stage !== "writing") payload.status = nextStatus;
        else payload.status = "writing"; // финал

        const { error } = await supabase
            .from("student_tests")
            .update(payload)
            .eq("id", studentTestId);

        if (error) throw error;
    },
};
