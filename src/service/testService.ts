// src/service/testService.ts
import { supabase } from "@/service/supabase";

type TestType = "listening" | "reading" | "writing";

const uid = () => Math.random().toString(36).slice(2);

// -------------------- HELPERS --------------------
async function safeSelectAll(table: string, column: string, ids: string[]) {
    if (!ids.length) return [];
    const res = await supabase.from(table).select("*").in(column, ids);
    if (res.error) return [];
    return res.data || [];
}
function groupByPartSafe(type: "listening" | "reading", sections: any[]) {
    const map = new Map<number, any>();

    for (const s of sections || []) {
        // ✅ если part_number нет — считаем что это Part 1
        const partNum = Number(s.part_number ?? 1);

        if (!map.has(partNum)) {
            map.set(partNum, {
                description: s.part_description ?? "",
                sections: [],
            });
        }

        const isReading = type === "reading";

        map.get(partNum).sections.push({
            id: s.id,


            title: isReading ? (s.passage_title ?? s.title ?? "") : (s.title ?? ""),
            content: isReading ? (s.passage_text ?? s.content ?? "") : (s.content ?? ""),

            image_url: s.image_url ?? null,
            question_type: s.question_type ?? "note_completion",


            order_number: Number(
                s.order_number ??
                // fallback
                s.section_number ??
                0
            ),

            section_number: Number(s.section_number ?? s.order_number ?? 0),

            questions: [],

            //  matching section-level
            matchingOptions: [],
        });
    }

    return [...map.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([_, part]) => {
            part.sections.sort(
                (a: any, b: any) => Number(a.order_number ?? 0) - Number(b.order_number ?? 0)
            );
            return part;
        });
}

function getPublicUrlSafe(bucket: string, path: string) {
    // ✅ чтобы TS/IDE не ругалась на getPublicUrl
    const api: any = supabase.storage.from(bucket);
    const { data } = api.getPublicUrl(path);
    // supabase v2: data.publicUrl
    return data?.publicUrl || data?.publicURL || null;
}

// -------------------- GET FULL TEST --------------------
async function getFullListeningTest(testId: string) {
    const { data: test, error: testErr } = await supabase
        .from("listening_tests")
        .select("*")
        .eq("id", testId)
        .single();
    if (testErr) throw testErr;


    const { data: sections, error: secErr } = await supabase
        .from("listening_sections")
        .select("*")
        .eq("test_id", testId)
        .order("part_number", { ascending: true })
        .order("section_number", { ascending: true });

    if (secErr) {
        const { data: sections2, error: secErr2 } = await supabase
            .from("listening_sections")
            .select("*")
            .eq("test_id", testId)
            .order("section_number", { ascending: true });
        if (secErr2) throw secErr2;
        return await hydrateListening(test, sections2 || []);
    }

    return await hydrateListening(test, sections || []);
}

async function hydrateListening(test: any, sections: any[]) {
    const parts = groupByPartSafe("listening", sections);
    const sectionIds = (sections || []).map((s: any) => s.id);
    if (!sectionIds.length) return { ...test, type: "listening", parts };

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

    // ✅ matching section-level tables
    const mItems = await safeSelectAll("listening_matching_items", "question_id", questionIds);
    const mOptions = await safeSelectAll("listening_matching_options", "question_id", questionIds);

    const answersByQ = new Map<string, any[]>();
    for (const a of answers) {
        const arr = answersByQ.get(a.question_id) || [];
        arr.push(a);
        answersByQ.set(a.question_id, arr);
    }

    const optionsByQ = new Map<string, any[]>();
    for (const o of options) {
        const arr = optionsByQ.get(o.question_id) || [];
        arr.push(o);
        optionsByQ.set(o.question_id, arr);
    }

    const mItemsByQ = new Map<string, any[]>();
    for (const it of mItems) {
        const arr = mItemsByQ.get(it.question_id) || [];
        arr.push(it);
        mItemsByQ.set(it.question_id, arr);
    }

    const mOptionsByQ = new Map<string, any[]>();
    for (const op of mOptions) {
        const arr = mOptionsByQ.get(op.question_id) || [];
        arr.push(op);
        mOptionsByQ.set(op.question_id, arr);
    }

    const sectionMap = new Map<string, any>();
    parts.forEach((p: any) => p.sections.forEach((s: any) => sectionMap.set(s.id, s)));

    for (const q of questions || []) {
        const s = sectionMap.get(q.section_id);
        if (!s) continue;

        const qType = q.question_type ?? s.question_type ?? "note_completion";
        const optList = optionsByQ.get(q.id) || [];

        const sectionMatchOpts = (mOptionsByQ.get(q.id) || [])
            .sort((a, b) => String(a.option_label ?? "").localeCompare(String(b.option_label ?? "")))
            .map((o) => ({ id: o.id, text: o.option_text ?? "", label: o.option_label ?? "" }));

        if (qType === "matching" && sectionMatchOpts.length) {
            s.matchingOptions = sectionMatchOpts.map((o: any) => ({ id: o.id, text: o.text }));
        }

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

            matchingOptions: sectionMatchOpts.map((o: any) => ({ id: o.id, text: o.text })),

            matchingItems: (mItemsByQ.get(q.id) || []).map((it) => ({
                name: it.item_text ?? "",
                matchedOption: it.correct_option_id ?? null,
            })),
        });
    }

    return { ...test, type: "listening", parts };
}

async function getFullReadingTest(testId: string) {
    const { data: test, error: testErr } = await supabase
        .from("reading_tests")
        .select("*")
        .eq("id", testId)
        .single();
    if (testErr) throw testErr;

    const { data: sections, error: secErr } = await supabase
        .from("reading_sections")
        .select("*")
        .eq("test_id", testId)
        .order("part_number", { ascending: true })
        .order("order_number", { ascending: true });

    if (secErr) throw secErr;

    const parts = groupByPartSafe("reading", sections || []);
    const sectionIds = (sections || []).map((s: any) => s.id);
    if (!sectionIds.length) return { ...test, type: "reading", parts };

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
    for (const a of answers) {
        const arr = answersByQ.get(a.question_id) || [];
        arr.push(a);
        answersByQ.set(a.question_id, arr);
    }

    const optionsByQ = new Map<string, any[]>();
    for (const o of options) {
        const arr = optionsByQ.get(o.question_id) || [];
        arr.push(o);
        optionsByQ.set(o.question_id, arr);
    }

    const mItemsByQ = new Map<string, any[]>();
    for (const it of mItems) {
        const arr = mItemsByQ.get(it.question_id) || [];
        arr.push(it);
        mItemsByQ.set(it.question_id, arr);
    }

    const mOptionsByQ = new Map<string, any[]>();
    for (const op of mOptions) {
        const arr = mOptionsByQ.get(op.question_id) || [];
        arr.push(op);
        mOptionsByQ.set(op.question_id, arr);
    }

    const sectionMap = new Map<string, any>();
    parts.forEach((p: any) => p.sections.forEach((s: any) => sectionMap.set(s.id, s)));

    for (const q of questions || []) {
        const s = sectionMap.get(q.section_id);
        if (!s) continue;

        const qType = q.question_type ?? s.question_type ?? "note_completion";
        const optList = optionsByQ.get(q.id) || [];

        const sectionMatchOpts = (mOptionsByQ.get(q.id) || [])
            .sort((a, b) => String(a.option_label ?? "").localeCompare(String(b.option_label ?? "")))
            .map((o) => ({ id: o.id, text: o.option_text ?? "", label: o.option_label ?? "" }));

        if (qType === "matching" && sectionMatchOpts.length) {
            s.matchingOptions = sectionMatchOpts.map((o: any) => ({ id: o.id, text: o.text }));
        }

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

            matchingOptions: sectionMatchOpts.map((o: any) => ({ id: o.id, text: o.text })),

            matchingItems: (mItemsByQ.get(q.id) || []).map((it) => ({
                name: it.item_text ?? "",
                matchedOption: it.correct_option_id ?? null,
            })),
        });
    }

    return { ...test, type: "reading", parts };
}

async function getFullWritingTest(testId: string) {
    const { data: test, error } = await supabase
        .from("writing_tests")
        .select("*")
        .eq("id", testId)
        .single();

    if (error) throw error;

    //  UpdateTestModal structure
    return {
        ...test,
        type: "writing",
        parts: [
            { description: "Task 1", sections: [{ title: test.task1_title ?? "", content: test.task1_question ?? "", questions: [] }] },
            { description: "Task 2", sections: [{ title: test.task2_title ?? "", content: test.task2_question ?? "", questions: [] }] },
        ],
    };
}

// -------------------- UPDATE FULL TEST --------------------
async function updateFullTest(payload: any) {
    if (payload.type === "reading") return await updateReading(payload);
    if (payload.type === "listening") return await updateListening(payload);
    if (payload.type === "writing") return await updateWriting(payload);
    throw new Error("Unsupported test type");
}
async function updateReading(payload: any) {
    const { error: testErr } = await supabase
        .from("reading_tests")
        .update({
            title: payload.title,
            duration: payload.duration,
            description: payload.description,
        })
        .eq("id", payload.id);

    if (testErr) throw testErr;


    const { error: delErr } = await supabase
        .from("reading_sections")
        .delete()
        .eq("test_id", payload.id);

    if (delErr) throw delErr;

    const parts = payload.parts || [];

    for (let pIndex = 0; pIndex < parts.length; pIndex++) {
        const part = parts[pIndex];
        const sections = part.sections || [];

        for (let sIndex = 0; sIndex < sections.length; sIndex++) {
            const s = sections[sIndex];

            // ✅ создаём секцию с part_number + order_number
            const { data: createdSection, error: secErr } = await supabase
                .from("reading_sections")
                .insert({
                    test_id: payload.id,

                    part_number: pIndex + 1,
                    order_number: sIndex + 1,


                    section_number: sIndex + 1,

                    passage_title: s.title ?? "",
                    passage_text: s.content ?? "",
                    question_type: s.questionType ?? "note_completion",
                })
                .select()
                .single();

            if (secErr) throw secErr;

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

                // ✅ NOTE COMPLETION
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

                // ✅ MULTIPLE CHOICE
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

                // ✅ MATCHING (SECTION LEVEL) — делаем ОДИН РАЗ на секцию
                if (s.questionType === "matching" && qIndex === 0) {
                    const sectionOpts = Array.isArray(s.matchingOptions) ? s.matchingOptions : [];

                    // creating options A,B,C...
                    const payloadMO = sectionOpts
                        .filter((o: any) => (o.text ?? "").trim() !== "")
                        .map((o: any, i: number) => ({
                            question_id: createdQ.id, // anchor question
                            option_label: String.fromCharCode(65 + i),
                            option_text: o.text ?? "",
                        }));

                    const moRes = await supabase.from("reading_matching_options").insert(payloadMO).select();
                    if (moRes.error) throw moRes.error;

                    const dbOptions = moRes.data || [];

                    // map: 'A' -> uuid
                    const labelToDb = new Map<string, string>();
                    dbOptions.forEach((dbOpt: any) => {
                        if (dbOpt.option_label) labelToDb.set(dbOpt.option_label, dbOpt.id);
                    });

                    // items = section.questions (каждый question = item)
                    const payloadMI = (s.questions || [])
                        .filter((it: any) => (it.text ?? "").trim() !== "")
                        .map((it: any) => ({
                            question_id: createdQ.id,
                            item_text: it.text ?? "",
                            correct_option_id: it.matchedOption ? (labelToDb.get(it.matchedOption) || null) : null,
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
}
async function updateListening(payload: any) {
    const { error: testErr } = await supabase
        .from("listening_tests")
        .update({
            title: payload.title,
            duration: payload.duration,
            description: payload.description,
        })
        .eq("id", payload.id);
    if (testErr) throw testErr;

    if (payload.audioFile) {
        const audioUrl = await uploadAudio(payload.audioFile, payload.id);
        const { error: audioErr } = await supabase
            .from("listening_tests")
            .update({ audio_url: audioUrl })
            .eq("id", payload.id);
        if (audioErr) throw audioErr;
    }

    const { error: delErr } = await supabase.from("listening_sections").delete().eq("test_id", payload.id);
    if (delErr) throw delErr;

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

                // ✅ matching section-level — 1 раз на секцию
                if (s.questionType === "matching" && qIndex === 0) {
                    const sectionOpts = Array.isArray(s.matchingOptions) ? s.matchingOptions : [];

                    const payloadMO = sectionOpts
                        .filter((o: any) => (o.text ?? "").trim() !== "")
                        .map((o: any, i: number) => ({
                            question_id: createdQ.id,
                            option_label: String.fromCharCode(65 + i),
                            option_text: o.text ?? "",
                        }));

                    const moRes = await supabase.from("listening_matching_options").insert(payloadMO).select();
                    if (moRes.error) throw moRes.error;

                    const dbOptions = moRes.data || [];
                    const labelToDb = new Map<string, string>();
                    dbOptions.forEach((dbOpt: any) => {
                        if (dbOpt.option_label) labelToDb.set(dbOpt.option_label, dbOpt.id);
                    });

                    const sectionQuestions = Array.isArray(s.questions) ? s.questions : [];
                    const payloadMI = sectionQuestions
                        .filter((it: any) => (it.text ?? "").trim() !== "")
                        .map((it: any) => ({
                            question_id: createdQ.id,
                            item_text: it.text ?? "",
                            correct_option_id: it.matchedOption ? labelToDb.get(it.matchedOption) || null : null,
                        }));

                    if (payloadMI.length) {
                        const miRes = await supabase.from("listening_matching_items").insert(payloadMI);
                        if (miRes.error) throw miRes.error;
                    }
                }
            }
        }
    }

    return true;
}

async function updateWriting(payload: any) {

    const { error } = await supabase
        .from("writing_tests")
        .update({
            title: payload.title,
            duration: payload.duration,
            description: payload.description,

        })
        .eq("id", payload.id);

    if (error) throw error;
    return true;
}

// -------------------- STORAGE --------------------
async function uploadAudio(file: File, testId: string) {
    const ext = file.name.split(".").pop() || "mp3";
    const filePath = `${testId}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
        .from("audio-files")
        .upload(filePath, file, { upsert: false, contentType: file.type });

    if (error) throw error;

    const publicUrl = getPublicUrlSafe("audio-files", filePath);
    if (!publicUrl) throw new Error("Failed to build public audio URL");
    return publicUrl;
}
// -------------------- CREATE LISTENING MATCHING OPTIONS --------------------
async function createListeningMatchingOptions(
    questionId: string,
    options: { label: string; text: string }[]
) {
    if (!options.length) return [];

    const payload = options.map((opt) => ({
        question_id: questionId,
        option_label: opt.label,
        option_text: opt.text,
    }));

    const { data, error } = await supabase
        .from("listening_matching_options")
        .insert(payload)
        .select();

    if (error) throw error;
    return data || [];
}

// -------------------- CREATE READING MATCHING OPTIONS --------------------
async function createReadingMatchingOptions(
    questionId: string,
    options: { label: string; text: string }[]
) {
    if (!options.length) return [];

    const payload = options.map((opt) => ({
        question_id: questionId,
        option_label: opt.label,
        option_text: opt.text,
    }));

    const { data, error } = await supabase
        .from("reading_matching_options")
        .insert(payload)
        .select();

    if (error) throw error;
    return data || [];
}
// -------------------- EXPORT --------------------
export const testService = {
    getFullTest: async (type: TestType, testId: string) => {
        if (type === "listening") return await getFullListeningTest(testId);
        if (type === "reading") return await getFullReadingTest(testId);
        if (type === "writing") return await getFullWritingTest(testId);
        throw new Error("Unsupported type for getFullTest");
    },

    updateFullTest,

    uploadAudio,
    createListeningMatchingOptions,
    createReadingMatchingOptions,
};

