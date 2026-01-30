// src/service/testService.ts
import { supabase } from "@/service/supabase"

// ✅ Общие типы
export type TestType = "reading" | "listening" | "writing"
export type QuestionType =
    | "note_completion"
    | "multiple_choice"
    | "matching"
    | "sentence_completion"
    | "short_answer"
    | "diagram_labeling"

export type OptionInput = { id?: number | string; text: string }
export type MatchingItemInput = {
    id?: string
    name: string
    // для сохранения: выбранная option (uuid из *_matching_options)
    matchedOptionId?: string | null
}
export type MatchingOptionInput = { id?: string; text: string }

export interface LocalQuestion {
    id?: string
    text: string
    order_number?: number

    // note_completion
    answers?: string[]

    // multiple_choice
    options?: OptionInput[]
    correctOption?: number | string | null

    // matching
    matchingItems?: MatchingItemInput[]
    matchingOptions?: MatchingOptionInput[]
}

export interface LocalSection {
    id?: string
    title: string
    content: string
    questionType: QuestionType
    imageUrl?: string | null
    section_number?: number
    part_number?: number
    questions: LocalQuestion[]
}

export interface LocalPart {
    description?: string
    sections: LocalSection[]
}

export interface LocalTestPayload {
    id: string
    title: string
    duration: number
    description?: string | null
    audio_url?: string | null // только listening
    testParts: LocalPart[]
}

// ✅ ВАЖНО: подстрой под свои реальные имена колонок/таблиц (если отличаются)
const T = {
    listening_tests: "listening_tests",
    listening_sections: "listening_sections",
    listening_questions: "listening_questions",
    listening_answers: "listening_answers",
    listening_options: "listening_options",
    listening_matching_items: "listening_matching_items",
    listening_matching_options: "listening_matching_options",

    reading_tests: "reading_tests",
    reading_sections: "reading_sections",
    reading_questions: "reading_questions",
    reading_answers: "reading_answers",
    reading_options: "reading_options",
    reading_matching_items: "reading_matching_items",
    reading_matching_options: "reading_matching_options",
} as const

function must<T>(data: T | null, error: any): T {
    if (error) throw error
    if (!data) throw new Error("Empty response from Supabase")
    return data
}

function sortByNumber(a: any, b: any, key: string) {
    return (a?.[key] ?? 0) - (b?.[key] ?? 0)
}

export const testService = {
    // =========================================================
    // READ FULL (для UpdateModal)
    // =========================================================
    async getReadingTestFull(testId: string) {
        const { data, error } = await supabase
            .from(T.reading_tests)
            .select(
                `
        id, title, duration, description,
        reading_sections (
          id, title, content, part_number, section_number, question_type, image_url,
          reading_questions (
            id, order_number, text,
            reading_answers ( id, answer_text, blank_index ),
            reading_options ( id, option_text, option_index, is_correct ),
            reading_matching_items ( id, item_text, correct_option_id ),
            reading_matching_options ( id, option_text )
          )
        )
      `
            )
            .eq("id", testId)
            .single()

        return must(data, error)
    },

    async getListeningTestFull(testId: string) {
        const { data, error } = await supabase
            .from(T.listening_tests)
            .select(
                `
        id, title, duration, description, audio_url,
        listening_sections (
          id, title, content, part_number, section_number, question_type, image_url,
          listening_questions (
            id, order_number, text,
            listening_answers ( id, answer_text, blank_index ),
            listening_options ( id, option_text, option_index, is_correct ),
            listening_matching_items ( id, item_text, correct_option_id ),
            listening_matching_options ( id, option_text )
          )
        )
      `
            )
            .eq("id", testId)
            .single()

        return must(data, error)
    },

    // =========================================================
    // CREATE (если нужно оставить как было)
    // =========================================================
    async createReadingTest(testData: any, userId: string) {
        const { data, error } = await supabase
            .from(T.reading_tests)
            .insert([
                {
                    title: testData.title,
                    duration: testData.duration,
                    description: testData.description ?? null,
                    created_by: userId,
                    total_parts: testData.total_parts ?? 0,
                    total_sections: testData.total_sections ?? 0,
                    total_questions: testData.total_questions ?? 0,
                },
            ])
            .select()
            .single()
        return must(data, error)
    },

    async createListeningTest(testData: any, userId: string) {
        const { data, error } = await supabase
            .from(T.listening_tests)
            .insert([
                {
                    title: testData.title,
                    duration: testData.duration,
                    description: testData.description ?? null,
                    created_by: userId,
                    total_parts: testData.total_parts ?? 0,
                    total_sections: testData.total_sections ?? 0,
                    total_questions: testData.total_questions ?? 0,
                    audio_url: testData.audioUrl ?? null,
                },
            ])
            .select()
            .single()
        return must(data, error)
    },

    async createReadingSection(sectionData: any, testId: string, partNumber: number, sectionNumber: number) {
        const { data, error } = await supabase
            .from(T.reading_sections)
            .insert([
                {
                    test_id: testId,
                    title: sectionData.title,
                    content: sectionData.content,
                    part_number: partNumber,
                    section_number: sectionNumber,
                    order_number: sectionNumber,
                    question_type: sectionData.questionType,
                    question_count: sectionData.questions?.length || 0,
                    image_url: sectionData.imageUrl ?? null,
                },
            ])
            .select()
            .single()
        return must(data, error)
    },

    async createListeningSection(sectionData: any, testId: string, partNumber: number, sectionNumber: number) {
        const { data, error } = await supabase
            .from(T.listening_sections)
            .insert([
                {
                    test_id: testId,
                    title: sectionData.title,
                    content: sectionData.content,
                    part_number: partNumber,
                    section_number: sectionNumber,
                    order_number: sectionNumber,
                    question_type: sectionData.questionType,
                    question_count: sectionData.questions?.length || 0,
                    image_url: sectionData.imageUrl ?? null,
                },
            ])
            .select()
            .single()
        return must(data, error)
    },

    async createReadingQuestion(questionData: any, sectionId: string, orderNumber: number) {
        const { data, error } = await supabase
            .from(T.reading_questions)
            .insert([
                {
                    section_id: sectionId,
                    text: questionData.text,
                    order_number: orderNumber,
                    question_type: questionData.type,
                },
            ])
            .select()
            .single()
        return must(data, error)
    },

    async createListeningQuestion(questionData: any, sectionId: string, orderNumber: number) {
        const { data, error } = await supabase
            .from(T.listening_questions)
            .insert([
                {
                    section_id: sectionId,
                    text: questionData.text,
                    order_number: orderNumber,
                    question_type: questionData.type,
                },
            ])
            .select()
            .single()
        return must(data, error)
    },

    // =========================================================
    // CREATE: Answers / Options / Matching
    // =========================================================
    async createReadingAnswers(questionId: string, answers: string[]) {
        const payload = (answers || []).map((a, i) => ({
            question_id: questionId,
            answer_text: a,
            blank_index: i + 1,
        }))
        const { data, error } = await supabase.from(T.reading_answers).insert(payload).select()
        return must(data, error)
    },

    async createListeningAnswers(questionId: string, answers: string[]) {
        const payload = (answers || []).map((a, i) => ({
            question_id: questionId,
            answer_text: a,
            blank_index: i + 1,
        }))
        const { data, error } = await supabase.from(T.listening_answers).insert(payload).select()
        return must(data, error)
    },

    async createReadingOptions(questionId: string, options: OptionInput[], correctOption: number | string | null) {
        const payload = (options || []).map((o, idx) => ({
            question_id: questionId,
            option_text: o.text,
            option_index: idx, // 0..n-1
            is_correct: correctOption === (o.id ?? idx),
        }))
        const { data, error } = await supabase.from(T.reading_options).insert(payload).select()
        return must(data, error)
    },

    async createListeningOptions(questionId: string, options: OptionInput[], correctOption: number | string | null) {
        const payload = (options || []).map((o, idx) => ({
            question_id: questionId,
            option_text: o.text,
            option_index: idx,
            is_correct: correctOption === (o.id ?? idx),
        }))
        const { data, error } = await supabase.from(T.listening_options).insert(payload).select()
        return must(data, error)
    },

    // matching: сначала options, потом items с correct_option_id
    async createReadingMatching(questionId: string, items: MatchingItemInput[], options: MatchingOptionInput[]) {
        // 1) options
        const { data: optRows, error: optErr } = await supabase
            .from(T.reading_matching_options)
            .insert((options || []).map(o => ({ question_id: questionId, option_text: o.text })))
            .select()

        const savedOptions = must(optRows, optErr)

        // 2) items -> correct_option_id по matchedOptionId или по индексу (если matchedOptionId пуст)
        const { data: itemRows, error: itemErr } = await supabase
            .from(T.reading_matching_items)
            .insert(
                (items || []).map((it, idx) => ({
                    question_id: questionId,
                    item_text: it.name,
                    correct_option_id: it.matchedOptionId ?? null, // ✅ если ты выбираешь uuid option
                }))
            )
            .select()

        const savedItems = must(itemRows, itemErr)
        return { options: savedOptions, items: savedItems }
    },

    async createListeningMatching(questionId: string, items: MatchingItemInput[], options: MatchingOptionInput[]) {
        const { data: optRows, error: optErr } = await supabase
            .from(T.listening_matching_options)
            .insert((options || []).map(o => ({ question_id: questionId, option_text: o.text })))
            .select()

        const savedOptions = must(optRows, optErr)

        const { data: itemRows, error: itemErr } = await supabase
            .from(T.listening_matching_items)
            .insert(
                (items || []).map(it => ({
                    question_id: questionId,
                    item_text: it.name,
                    correct_option_id: it.matchedOptionId ?? null,
                }))
            )
            .select()

        const savedItems = must(itemRows, itemErr)
        return { options: savedOptions, items: savedItems }
    },

    // =========================================================
    // UPDATE FULL (для UpdateModal) — самый простой вариант:
    // 1) update test
    // 2) удалить старые sections (cascade удалит вопросы/ответы/опции)
    // 3) заново вставить sections/questions/answers/options/matching
    // =========================================================
    async updateReadingTestFull(payload: LocalTestPayload) {
        // 1) update base test
        const { error: testErr } = await supabase
            .from(T.reading_tests)
            .update({
                title: payload.title,
                duration: payload.duration,
                description: payload.description ?? null,
            })
            .eq("id", payload.id)
        if (testErr) throw testErr

        // 2) delete old sections (cascade)
        const { error: delErr } = await supabase.from(T.reading_sections).delete().eq("test_id", payload.id)
        if (delErr) throw delErr

        // 3) recreate tree
        for (let pIndex = 0; pIndex < payload.testParts.length; pIndex++) {
            const part = payload.testParts[pIndex]
            for (let sIndex = 0; sIndex < part.sections.length; sIndex++) {
                const sec = part.sections[sIndex]
                const createdSection = await this.createReadingSection(
                    {
                        title: sec.title,
                        content: sec.content,
                        questionType: sec.questionType,
                        imageUrl: sec.imageUrl ?? null,
                        questions: sec.questions,
                    },
                    payload.id,
                    pIndex + 1,
                    sIndex + 1
                )

                for (let qIndex = 0; qIndex < sec.questions.length; qIndex++) {
                    const q = sec.questions[qIndex]
                    const createdQ = await this.createReadingQuestion(
                        { text: q.text, type: sec.questionType },
                        createdSection.id,
                        qIndex + 1
                    )

                    if (sec.questionType === "note_completion") {
                        await this.createReadingAnswers(createdQ.id, q.answers || [])
                    } else if (sec.questionType === "multiple_choice") {
                        await this.createReadingOptions(createdQ.id, q.options || [], q.correctOption ?? null)
                    } else if (sec.questionType === "matching") {
                        await this.createReadingMatching(createdQ.id, q.matchingItems || [], q.matchingOptions || [])
                    }
                }
            }
        }

        return true
    },

    async updateListeningTestFull(payload: LocalTestPayload) {
        // 1) update base test
        const { error: testErr } = await supabase
            .from(T.listening_tests)
            .update({
                title: payload.title,
                duration: payload.duration,
                description: payload.description ?? null,
                audio_url: payload.audio_url ?? null,
            })
            .eq("id", payload.id)
        if (testErr) throw testErr

        // 2) delete old sections (cascade)
        const { error: delErr } = await supabase.from(T.listening_sections).delete().eq("test_id", payload.id)
        if (delErr) throw delErr

        // 3) recreate tree
        for (let pIndex = 0; pIndex < payload.testParts.length; pIndex++) {
            const part = payload.testParts[pIndex]
            for (let sIndex = 0; sIndex < part.sections.length; sIndex++) {
                const sec = part.sections[sIndex]
                const createdSection = await this.createListeningSection(
                    {
                        title: sec.title,
                        content: sec.content,
                        questionType: sec.questionType,
                        imageUrl: sec.imageUrl ?? null,
                        questions: sec.questions,
                    },
                    payload.id,
                    pIndex + 1,
                    sIndex + 1
                )

                for (let qIndex = 0; qIndex < sec.questions.length; qIndex++) {
                    const q = sec.questions[qIndex]
                    const createdQ = await this.createListeningQuestion(
                        { text: q.text, type: sec.questionType },
                        createdSection.id,
                        qIndex + 1
                    )

                    if (sec.questionType === "note_completion") {
                        await this.createListeningAnswers(createdQ.id, q.answers || [])
                    } else if (sec.questionType === "multiple_choice") {
                        await this.createListeningOptions(createdQ.id, q.options || [], q.correctOption ?? null)
                    } else if (sec.questionType === "matching") {
                        await this.createListeningMatching(createdQ.id, q.matchingItems || [], q.matchingOptions || [])
                    }
                }
            }
        }

        return true
    },

    // =========================================================
    // Helpers (если хочешь собрать данные из full -> LocalTestPayload)
    // =========================================================
    mapFullToLocalReading(full: any): LocalTestPayload {
        const sections = (full?.reading_sections || []).slice().sort((a: any, b: any) => sortByNumber(a, b, "section_number"))

        const partsMap = new Map<number, LocalPart>()
        sections.forEach((sec: any) => {
            const p = sec.part_number ?? 1
            if (!partsMap.has(p)) partsMap.set(p, { description: "", sections: [] })

            const qs = (sec.reading_questions || []).slice().sort((a: any, b: any) => sortByNumber(a, b, "order_number"))
            partsMap.get(p)!.sections.push({
                id: sec.id,
                title: sec.title || "",
                content: sec.content || "",
                questionType: sec.question_type || "note_completion",
                imageUrl: sec.image_url ?? null,
                part_number: sec.part_number ?? 1,
                section_number: sec.section_number ?? 1,
                questions: qs.map((q: any) => {
                    const answers = (q.reading_answers || []).slice().sort((a: any, b: any) => sortByNumber(a, b, "blank_index")).map((x: any) => x.answer_text)
                    const opts = (q.reading_options || []).slice().sort((a: any, b: any) => sortByNumber(a, b, "option_index"))
                    const correct = opts.find((o: any) => o.is_correct)?.option_index ?? null

                    return {
                        id: q.id,
                        text: q.text || "",
                        order_number: q.order_number ?? 1,
                        answers,
                        options: opts.map((o: any) => ({ id: o.option_index, text: o.option_text })),
                        correctOption: correct,
                        matchingItems: (q.reading_matching_items || []).map((i: any) => ({
                            id: i.id,
                            name: i.item_text,
                            matchedOptionId: i.correct_option_id ?? null,
                        })),
                        matchingOptions: (q.reading_matching_options || []).map((o: any) => ({
                            id: o.id,
                            text: o.option_text,
                        })),
                    }
                }),
            })
        })

        return {
            id: full.id,
            title: full.title,
            duration: full.duration,
            description: full.description ?? null,
            testParts: [...partsMap.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v),
        }
    },

    mapFullToLocalListening(full: any): LocalTestPayload {
        const sections = (full?.listening_sections || []).slice().sort((a: any, b: any) => sortByNumber(a, b, "section_number"))

        const partsMap = new Map<number, LocalPart>()
        sections.forEach((sec: any) => {
            const p = sec.part_number ?? 1
            if (!partsMap.has(p)) partsMap.set(p, { description: "", sections: [] })

            const qs = (sec.listening_questions || []).slice().sort((a: any, b: any) => sortByNumber(a, b, "order_number"))
            partsMap.get(p)!.sections.push({
                id: sec.id,
                title: sec.title || "",
                content: sec.content || "",
                questionType: sec.question_type || "note_completion",
                imageUrl: sec.image_url ?? null,
                part_number: sec.part_number ?? 1,
                section_number: sec.section_number ?? 1,
                questions: qs.map((q: any) => {
                    const answers = (q.listening_answers || []).slice().sort((a: any, b: any) => sortByNumber(a, b, "blank_index")).map((x: any) => x.answer_text)
                    const opts = (q.listening_options || []).slice().sort((a: any, b: any) => sortByNumber(a, b, "option_index"))
                    const correct = opts.find((o: any) => o.is_correct)?.option_index ?? null

                    return {
                        id: q.id,
                        text: q.text || "",
                        order_number: q.order_number ?? 1,
                        answers,
                        options: opts.map((o: any) => ({ id: o.option_index, text: o.option_text })),
                        correctOption: correct,
                        matchingItems: (q.listening_matching_items || []).map((i: any) => ({
                            id: i.id,
                            name: i.item_text,
                            matchedOptionId: i.correct_option_id ?? null,
                        })),
                        matchingOptions: (q.listening_matching_options || []).map((o: any) => ({
                            id: o.id,
                            text: o.option_text,
                        })),
                    }
                }),
            })
        })

        return {
            id: full.id,
            title: full.title,
            duration: full.duration,
            description: full.description ?? null,
            audio_url: full.audio_url ?? null,
            testParts: [...partsMap.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v),
        }
    },
}

export default testService
