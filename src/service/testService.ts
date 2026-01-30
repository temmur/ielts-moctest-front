// src/service/testService.ts
import { supabase } from "@/service/supabase";

type TestType = "listening" | "reading";

const uid = () => Math.random().toString(36).slice(2);

const groupByPartSafe = (type: TestType, sections: any[]) => {
    if (type === "listening") {
        const map = new Map<number, any>();

        for (const s of sections) {
            const partNum = Number(s.part_number ?? 1);

            if (!map.has(partNum)) {
                map.set(partNum, { description: s.part_description ?? "", sections: [] });
            }

            map.get(partNum).sections.push({
                id: s.id,
                title: s.title ?? "",
                content: s.content ?? "",
                image_url: s.image_url ?? null,
                question_type: s.question_type ?? "note_completion",
                section_number: s.section_number ?? s.order_number ?? 0,
                questions: [],
            });
        }

        return [...map.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([_, part]) => {
                part.sections.sort((a: any, b: any) => Number(a.section_number ?? 0) - Number(b.section_number ?? 0));
                return part;
            });
    }

    // READING: part_number нет -> все секции в Part 1
    const part = {
        description: "",
        sections: (sections || [])
            .map((s: any) => ({
                id: s.id,
                title: s.passage_title ?? s.title ?? "",
                content: s.passage_text ?? s.content ?? "",
                image_url: s.image_url ?? null,
                question_type: s.question_type ?? "note_completion",
                section_number: s.section_number ?? 0,
                questions: [],
            }))
            .sort((a: any, b: any) => Number(a.section_number ?? 0) - Number(b.section_number ?? 0)),
    };

    return [part];
};

async function safeSelectAll(table: string, column: string, ids: string[]) {
    if (!ids.length) return [];
    const res = await supabase.from(table).select("*").in(column, ids);
    if (res.error) return []; // если таблицы нет — просто вернём пусто
    return res.data || [];
}

export const testService = {
    // -------------------- GET FULL TEST --------------------
    async getFullTest(type: TestType, testId: string) {
        if (type === "listening") return await this.getFullListeningTest(testId);
        if (type === "reading") return await this.getFullReadingTest(testId);
        throw new Error("Unsupported type for getFullTest");
    },

    // ---------------- LISTENING GET ----------------
    async getFullListeningTest(testId: string) {
        const { data: test, error: testErr } = await supabase
            .from("listening_tests")
            .select("*")
            .eq("id", testId)
            .single();
        if (testErr) throw testErr;

        // пробуем сортировку с part_number, если колонка есть
        const { data: sections, error: secErr } = await supabase
            .from("listening_sections")
            .select("*")
            .eq("test_id", testId)
            .order("part_number", { ascending: true })
            .order("section_number", { ascending: true });

        if (secErr) {
            // fallback без part_number
            const { data: sections2, error: secErr2 } = await supabase
                .from("listening_sections")
                .select("*")
                .eq("test_id", testId)
                .order("section_number", { ascending: true });
            if (secErr2) throw secErr2;

            return await this._hydrateListening(test, sections2 || []);
        }

        return await this._hydrateListening(test, sections || []);
    },

    async _hydrateListening(test: any, sections: any[]) {
        const parts = groupByPartSafe("listening", sections);
        const sectionIds = (sections || []).map((s: any) => s.id);

        if (!sectionIds.length) return { ...test, type: "listening", parts };

        // ✅ НЕ question_number, а order_number
        const { data: questions, error: qErr } = await supabase
            .from("listening_questions")
            .select("*")
            .in("section_id", sectionIds)
            .order("order_number", { ascending: true });

        if (qErr) throw qErr;

        const questionIds = (questions || []).map((q: any) => q.id);
        if (!questionIds.length) return { ...test, type: "listening", parts };

        const answers = await safeSelectAll("listening_answers", "question_id", questionIds);
        const options = await safeSelectAll("listening_options", "question_id", questionIds);
        const mItems = await safeSelectAll("listening_matching_items", "question_id", questionIds);
        const mOptions = await safeSelectAll("listening_matching_options", "question_id", questionIds);

        const answersByQ = new Map<string, any[]>();
        answers.forEach((a) => {
            const arr = answersByQ.get(a.question_id) || [];
            arr.push(a);
            answersByQ.set(a.question_id, arr);
        });

        const optionsByQ = new Map<string, any[]>();
        options.forEach((o) => {
            const arr = optionsByQ.get(o.question_id) || [];
            arr.push(o);
            optionsByQ.set(o.question_id, arr);
        });

        const mItemsByQ = new Map<string, any[]>();
        mItems.forEach((it) => {
            const arr = mItemsByQ.get(it.question_id) || [];
            arr.push(it);
            mItemsByQ.set(it.question_id, arr);
        });

        const mOptionsByQ = new Map<string, any[]>();
        mOptions.forEach((op) => {
            const arr = mOptionsByQ.get(op.question_id) || [];
            arr.push(op);
            mOptionsByQ.set(op.question_id, arr);
        });

        const sectionMap = new Map<string, any>();
        parts.forEach((p: any) => p.sections.forEach((s: any) => sectionMap.set(s.id, s)));

        for (const q of questions || []) {
            const s = sectionMap.get(q.section_id);
            if (!s) continue;

            const qType = q.question_type ?? s.question_type ?? "note_completion";
            const optList = optionsByQ.get(q.id) || [];

            s.questions.push({
                id: q.id,
                text: q.question_text ?? "",
                type: qType,

                answers: (answersByQ.get(q.id) || [])
                    .sort((a, b) => Number(a.blank_number ?? 0) - Number(b.blank_number ?? 0))
                    .map((a) => a.correct_answer ?? ""),

                options: optList
                    .sort((a, b) => String(a.option_label ?? "").localeCompare(String(b.option_label ?? "")))
                    .map((o) => ({ id: o.id, text: o.option_text ?? "" })),

                correctOption: optList.find((o) => o.is_correct)?.id ?? null,

                matchingOptions: (mOptionsByQ.get(q.id) || [])
                    .sort((a, b) => String(a.option_label ?? "").localeCompare(String(b.option_label ?? "")))
                    .map((o) => ({ id: o.id, text: o.option_text ?? "" })),

                matchingItems: (mItemsByQ.get(q.id) || []).map((it) => ({
                    name: it.item_text ?? "",
                    matchedOption: it.correct_option_id ?? null,
                })),
            });
        }

        return { ...test, type: "listening", parts };
    },

    // ---------------- READING GET ----------------
    async getFullReadingTest(testId: string) {
        const { data: test, error: testErr } = await supabase
            .from("reading_tests")
            .select("*")
            .eq("id", testId)
            .single();
        if (testErr) throw testErr;

        // ✅ part_number убрали
        const { data: sections, error: secErr } = await supabase
            .from("reading_sections")
            .select("*")
            .eq("test_id", testId)
            .order("section_number", { ascending: true });

        if (secErr) throw secErr;

        const parts = groupByPartSafe("reading", sections || []);
        const sectionIds = (sections || []).map((s: any) => s.id);
        if (!sectionIds.length) return { ...test, type: "reading", parts };

        // ✅ question_number нет -> order_number
        const { data: questions, error: qErr } = await supabase
            .from("reading_questions")
            .select("*")
            .in("section_id", sectionIds)
            .order("order_number", { ascending: true });

        if (qErr) throw qErr;

        const questionIds = (questions || []).map((q: any) => q.id);
        if (!questionIds.length) return { ...test, type: "reading", parts };

        const answers = await safeSelectAll("reading_answers", "question_id", questionIds);
        const options = await safeSelectAll("reading_options", "question_id", questionIds);
        const mItems = await safeSelectAll("reading_matching_items", "question_id", questionIds);
        const mOptions = await safeSelectAll("reading_matching_options", "question_id", questionIds);

        const answersByQ = new Map<string, any[]>();
        answers.forEach((a) => {
            const arr = answersByQ.get(a.question_id) || [];
            arr.push(a);
            answersByQ.set(a.question_id, arr);
        });

        const optionsByQ = new Map<string, any[]>();
        options.forEach((o) => {
            const arr = optionsByQ.get(o.question_id) || [];
            arr.push(o);
            optionsByQ.set(o.question_id, arr);
        });

        const mItemsByQ = new Map<string, any[]>();
        mItems.forEach((it) => {
            const arr = mItemsByQ.get(it.question_id) || [];
            arr.push(it);
            mItemsByQ.set(it.question_id, arr);
        });

        const mOptionsByQ = new Map<string, any[]>();
        mOptions.forEach((op) => {
            const arr = mOptionsByQ.get(op.question_id) || [];
            arr.push(op);
            mOptionsByQ.set(op.question_id, arr);
        });

        const sectionMap = new Map<string, any>();
        parts.forEach((p: any) => p.sections.forEach((s: any) => sectionMap.set(s.id, s)));

        for (const q of questions || []) {
            const s = sectionMap.get(q.section_id);
            if (!s) continue;

            const qType = q.question_type ?? s.question_type ?? "note_completion";
            const optList = optionsByQ.get(q.id) || [];

            s.questions.push({
                id: q.id,
                text: q.question_text ?? "",
                type: qType,

                answers: (answersByQ.get(q.id) || [])
                    .sort((a, b) => Number(a.blank_number ?? 0) - Number(b.blank_number ?? 0))
                    .map((a) => a.correct_answer ?? ""),

                options: optList
                    .sort((a, b) => String(a.option_label ?? "").localeCompare(String(b.option_label ?? "")))
                    .map((o) => ({ id: o.id, text: o.option_text ?? "" })),

                correctOption: optList.find((o) => o.is_correct)?.id ?? null,

                matchingOptions: (mOptionsByQ.get(q.id) || [])
                    .sort((a, b) => String(a.option_label ?? "").localeCompare(String(b.option_label ?? "")))
                    .map((o) => ({ id: o.id, text: o.option_text ?? "" })),

                matchingItems: (mItemsByQ.get(q.id) || []).map((it) => ({
                    name: it.item_text ?? "",
                    matchedOption: it.correct_option_id ?? null,
                })),
            });
        }

        return { ...test, type: "reading", parts };
    },

    // -------------------- UPDATE FULL TEST (Replace-All) --------------------
    async updateFullTest(payload: any) {
        if (payload.type === "reading") return await this._updateReading(payload);
        if (payload.type === "listening") return await this._updateListening(payload);
        throw new Error("Unsupported test type");
    },

    async _updateReading(payload: any) {
        // ✅ reading_tests не имеет audio_url и НЕ должен получать audioFile
        const { error: testErr } = await supabase
            .from("reading_tests")
            .update({
                title: payload.title,
                duration: payload.duration,
                description: payload.description,
            })
            .eq("id", payload.id);
        if (testErr) throw testErr;

        // 1) delete old sections (cascade -> questions/answers/options)
        const { error: delErr } = await supabase
            .from("reading_sections")
            .delete()
            .eq("test_id", payload.id);
        if (delErr) throw delErr;

        // 2) recreate sections/questions
        // reading: part_number нет -> просто по порядку section_number
        const flatSections = (payload.parts || []).flatMap((p: any) => p.sections || []);
        for (let sIndex = 0; sIndex < flatSections.length; sIndex++) {
            const s = flatSections[sIndex];

            const { data: createdSection, error: secErr } = await supabase
                .from("reading_sections")
                .insert({
                    test_id: payload.id,
                    section_number: sIndex + 1,
                    passage_title: s.title ?? "",
                    passage_text: s.content ?? "",
                    question_type: s.questionType ?? "note_completion",
                    // image_url: s.imageUrl || null,
                })
                .select()
                .single();
            if (secErr) throw secErr;

            // questions
            const questions = s.questions || [];
            for (let qIndex = 0; qIndex < questions.length; qIndex++) {
                const q = questions[qIndex];

                const { data: createdQ, error: qErr } = await supabase
                    .from("reading_questions")
                    .insert({
                        section_id: createdSection.id,
                        order_number: qIndex + 1,
                        question_text: q.text ?? "",
                        question_type: s.questionType ?? "note_completion",
                    })
                    .select()
                    .single();
                if (qErr) throw qErr;

                // note_completion
                if (s.questionType === "note_completion") {
                    const answers = Array.isArray(q.answers) ? q.answers : [];
                    if (answers.length) {
                        const payloadAns = answers.map((a: string, i: number) => ({
                            question_id: createdQ.id,
                            blank_number: i + 1,
                            correct_answer: a,
                        }));
                        const { error: ansErr } = await supabase.from("reading_answers").insert(payloadAns);
                        if (ansErr) throw ansErr;
                    }
                }

                // multiple_choice
                if (s.questionType === "multiple_choice") {
                    const opts = Array.isArray(q.options) ? q.options : [];
                    const payloadOpt = opts.map((o: any, i: number) => ({
                        question_id: createdQ.id,
                        option_label: String.fromCharCode(65 + i),
                        option_text: o.text ?? "",
                        is_correct: o.id === q.correctOption,
                    }));
                    if (payloadOpt.length) {
                        const { error: optErr } = await supabase.from("reading_options").insert(payloadOpt);
                        if (optErr) throw optErr;
                    }
                }

                // matching (если у тебя есть таблицы)
                if (s.questionType === "matching") {
                    // 1) options -> получаем db ids
                    const mOpts = Array.isArray(q.matchingOptions) ? q.matchingOptions : [];
                    const payloadMO = mOpts
                        .filter((o: any) => (o.text ?? "").trim() !== "")
                        .map((o: any, i: number) => ({
                            question_id: createdQ.id,
                            option_label: String.fromCharCode(65 + i),
                            option_text: o.text ?? "",
                        }));

                    const moRes = await supabase
                        .from("reading_matching_options")
                        .insert(payloadMO)
                        .select();

                    if (!moRes.error) {
                        const dbOptions = moRes.data || [];
                        // map localId -> dbId (localId = q.matchingOptions[i].id)
                        const localToDb = new Map<string, string>();
                        dbOptions.forEach((dbOpt: any, i: number) => {
                            const localId = mOpts[i]?.id;
                            if (localId) localToDb.set(localId, dbOpt.id);
                        });

                        // 2) items
                        const items = Array.isArray(q.matchingItems) ? q.matchingItems : [];
                        const payloadMI = items
                            .filter((it: any) => (it.name ?? "").trim() !== "")
                            .map((it: any) => ({
                                question_id: createdQ.id,
                                item_text: it.name ?? "",
                                correct_option_id: it.matchedOption ? localToDb.get(it.matchedOption) || null : null,
                            }));

                        if (payloadMI.length) {
                            const miRes = await supabase.from("reading_matching_items").insert(payloadMI);
                            if (miRes.error) throw miRes.error;
                        }
                    }
                }
            }
        }

        return true;
    },

    async _updateListening(payload: any) {
        // update base
        const { error: testErr } = await supabase
            .from("listening_tests")
            .update({
                title: payload.title,
                duration: payload.duration,
                description: payload.description,
            })
            .eq("id", payload.id);
        if (testErr) throw testErr;

        // если аудио поменяли — загрузим и обновим audio_url
        if (payload.audioFile) {
            const audioUrl = await this.uploadAudio(payload.audioFile, payload.id);
            const { error: audioErr } = await supabase
                .from("listening_tests")
                .update({ audio_url: audioUrl })
                .eq("id", payload.id);
            if (audioErr) throw audioErr;
        }

        // delete old sections (cascade)
        const { error: delErr } = await supabase
            .from("listening_sections")
            .delete()
            .eq("test_id", payload.id);
        if (delErr) throw delErr;

        // recreate parts/sections
        const parts = payload.parts || [];
        for (let pIndex = 0; pIndex < parts.length; pIndex++) {
            const part = parts[pIndex];
            const sections = part.sections || [];

            for (let sIndex = 0; sIndex < sections.length; sIndex++) {
                const s = sections[sIndex];

                const { data: createdSection, error: secErr } = await supabase
                    .from("listening_sections")
                    .insert({
                        test_id: payload.id,
                        part_number: pIndex + 1,
                        section_number: sIndex + 1,
                        order_number: sIndex + 1,
                        title: s.title ?? "",
                        content: s.content ?? "",
                        question_type: s.questionType ?? "note_completion",
                        question_count: (s.questions || []).length,
                        image_url: s.imageUrl || null,
                    })
                    .select()
                    .single();
                if (secErr) throw secErr;

                // questions
                const questions = s.questions || [];
                for (let qIndex = 0; qIndex < questions.length; qIndex++) {
                    const q = questions[qIndex];

                    const { data: createdQ, error: qErr } = await supabase
                        .from("listening_questions")
                        .insert({
                            section_id: createdSection.id,
                            order_number: qIndex + 1,
                            question_text: q.text ?? "",
                            question_type: s.questionType ?? "note_completion",
                        })
                        .select()
                        .single();
                    if (qErr) throw qErr;

                    // note_completion
                    if (s.questionType === "note_completion") {
                        const answers = Array.isArray(q.answers) ? q.answers : [];
                        if (answers.length) {
                            const payloadAns = answers.map((a: string, i: number) => ({
                                question_id: createdQ.id,
                                blank_number: i + 1,
                                correct_answer: a,
                            }));
                            const { error: ansErr } = await supabase.from("listening_answers").insert(payloadAns);
                            if (ansErr) throw ansErr;
                        }
                    }

                    // multiple_choice
                    if (s.questionType === "multiple_choice") {
                        const opts = Array.isArray(q.options) ? q.options : [];
                        const payloadOpt = opts.map((o: any, i: number) => ({
                            question_id: createdQ.id,
                            option_label: String.fromCharCode(65 + i),
                            option_text: o.text ?? "",
                            is_correct: o.id === q.correctOption,
                        }));
                        if (payloadOpt.length) {
                            const { error: optErr } = await supabase.from("listening_options").insert(payloadOpt);
                            if (optErr) throw optErr;
                        }
                    }

                    // matching (если таблицы есть)
                    if (s.questionType === "matching") {
                        const mOpts = Array.isArray(q.matchingOptions) ? q.matchingOptions : [];
                        const payloadMO = mOpts
                            .filter((o: any) => (o.text ?? "").trim() !== "")
                            .map((o: any, i: number) => ({
                                question_id: createdQ.id,
                                option_label: String.fromCharCode(65 + i),
                                option_text: o.text ?? "",
                            }));

                        const moRes = await supabase
                            .from("listening_matching_options")
                            .insert(payloadMO)
                            .select();

                        if (!moRes.error) {
                            const dbOptions = moRes.data || [];
                            const localToDb = new Map<string, string>();
                            dbOptions.forEach((dbOpt: any, i: number) => {
                                const localId = mOpts[i]?.id;
                                if (localId) localToDb.set(localId, dbOpt.id);
                            });

                            const items = Array.isArray(q.matchingItems) ? q.matchingItems : [];
                            const payloadMI = items
                                .filter((it: any) => (it.name ?? "").trim() !== "")
                                .map((it: any) => ({
                                    question_id: createdQ.id,
                                    item_text: it.name ?? "",
                                    correct_option_id: it.matchedOption ? localToDb.get(it.matchedOption) || null : null,
                                }));

                            if (payloadMI.length) {
                                const miRes = await supabase.from("listening_matching_items").insert(payloadMI);
                                if (miRes.error) throw miRes.error;
                            }
                        }
                    }
                }
            }
        }

        return true;
    },

    // -------------------- STORAGE --------------------
    async uploadAudio(file: File, testId: string) {
        const ext = file.name.split(".").pop() || "mp3";
        const filePath = `${testId}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

        const { error } = await supabase.storage
            .from("audio-files")
            .upload(filePath, file, { upsert: false, contentType: file.type });

        if (error) throw error;

        const { data } = supabase.storage.from("audio-files").getPublicUrl(filePath);
        return data.publicUrl;
    },
};
