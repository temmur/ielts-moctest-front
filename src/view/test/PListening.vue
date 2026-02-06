<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "@/lib/supabase";
import CAudioPlayer from "@/components/СAudioPlayer.vue";
import CPartPagination from "@/components/UI/CPartPagination.vue";
import CQuestionPagination from "@/components/UI/CQuestionPagination.vue";
/**
 * ✅ Supabase Storage bucket where ALL audio is stored (inside folders)
 */
const AUDIO_BUCKET = "audio-files";
const SECTION_IMAGES_BUCKET = "section-images";
const SECTION_IMAGES_PRIVATE = false; // если bucket PRIVATE -> true
/**
 * ✅ If bucket is PRIVATE -> true (signed urls)
 * If bucket is PUBLIC -> false (public urls)
 */
const AUDIO_BUCKET_PRIVATE = false;

type Stage = "listening" | "reading" | "writing" | "completed";

type StudentTestRow = {
  id: string;
  student_id: string;
  status: Stage;
  listening_test_id: string | null;
  reading_test_id: string | null;
  writing_test_id: string | null;

  listening_started_at?: string | null;
  listening_finished_at?: string | null;
  listening_score?: number | null;
};

type QType =
    | "note_completion"
    | "multiple_choice"
    | "matching"
    | "sentence_completion"
    | "short_answer"
    | "diagram_labeling"
    | string;

type ListeningQuestion = {
  id: string;
  order_number: number | null;
  question_text: string | null;
  question_type?: QType | null;
  global_number?: number;
};

type ListeningSection = {
  id: string;
  title: string | null;
  order_number: number | null;
  section_number: number | null;
  image_url?: string | null;
  part_number: number | null;
  question_type: QType | null;
  listening_questions: ListeningQuestion[];
};


const route = useRoute();
const router = useRouter();

const loading = ref(true);
const saving = ref(false);
const error = ref("");

const studentTest = ref<StudentTestRow | null>(null);
const test = ref<any>(null);
const sections = ref<ListeningSection[]>([]);
const answers = ref<Record<string, any>>({});

const timeLeft = ref(0);
const started = ref(false);

const audioError = ref("");
const playableAudioUrl = ref<string>("");

// ref на CAudioPlayer, чтобы дергать play() после Start
const audioPlayerRef = ref<InstanceType<typeof CAudioPlayer> | null>(null);

let timer: any = null;

const studentTestIdParam = computed(() => String(route.params.studentTestId || ""));

// ------ UI helpers ------
const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const stopTimer = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

const startTimer = () => {
  stopTimer();
  timer = setInterval(async () => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
      return;
    }
    await submitListening(true);
  }, 1000);
};

const preventLeave = (e: BeforeUnloadEvent) => {
  if (!started.value) return;
  e.preventDefault();
  e.returnValue = "";
};

// ------ DB helpers ------
const safeNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
type Token =
    | { type: "text"; value: string }
    | { type: "blank"; index: number };

function parseBlanks(text: string | null | undefined): Token[] {
  const str = String(text ?? "");
  const re = /\{\{(\d+)\}\}/g;

  const tokens: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(str))) {
    const start = m.index;
    const end = re.lastIndex;

    if (start > last) {
      tokens.push({ type: "text", value: str.slice(last, start) });
    }

    tokens.push({ type: "blank", index: Number(m[1]) });
    last = end;
  }

  if (last < str.length) {
    tokens.push({ type: "text", value: str.slice(last) });
  }

  return tokens;
}
function questionDomId(globalNo?: number) {
  return globalNo ? `q-${globalNo}` : "";
}

type QuestionLink = {
  global: number;
  partIndex: number;
  questionId: string;
};

type PartLinks = {
  partIndex: number;
  questions: QuestionLink[];
};

const paginationParts = computed<PartLinks[]>(() => {
  return parts.value.map((p, partIndex) => {
    const questions: QuestionLink[] = [];

    for (const s of p.sections) {
      for (const q of (s.listening_questions || [])) {
        const g = Number(q.global_number);
        if (!Number.isFinite(g)) continue;
        questions.push({
          global: g,
          partIndex,
          questionId: questionDomId(g),
        });
      }
    }

    // сорт по номеру вопроса
    questions.sort((a, b) => a.global - b.global);

    return { partIndex, questions };
  });
});

function scrollToQuestionDomId(id: string) {
  // важно: ждём отрисовку текущего part
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;

      // скролл с учётом sticky header
      const headerOffset = 92;
      const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;

      try {
        window.scrollTo({ top, behavior: "smooth" });
      } catch {
        window.scrollTo(0, top);
      }
    });
  });
}

async function onGoToQuestion(payload: { global: number; partIndex: number; questionId: string }) {
  // переключаем part
  currentPartIndex.value = payload.partIndex;

  // скроллим к вопросу
  scrollToQuestionDomId(payload.questionId);
}
function blankKey(questionId: string, blankIndex: number) {
  return `blank:${questionId}:${blankIndex}`;
}

function hasBlanks(text: string | null | undefined) {
  return /\{\{\d+\}\}/.test(String(text ?? ""));
}

async function loadStudentTestRow(): Promise<StudentTestRow> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  if (!session) {
    router.push("/login");
    throw new Error("No session");
  }

  if (studentTestIdParam.value) {
    const { data: row, error: rowErr } = await supabase
        .from("student_tests")
        .select("*")
        .eq("id", studentTestIdParam.value)
        .single();

    if (rowErr) throw rowErr;
    if (row.student_id !== session.user.id) throw new Error("Access denied");
    return row as StudentTestRow;
  }

  const { data: row, error: rowErr } = await supabase
      .from("student_tests")
      .select("*")
      .eq("student_id", session.user.id)
      .single();

  if (rowErr) throw rowErr;
  return row as StudentTestRow;
}

// ------ Question data maps ------
const optionsByQ = ref<Map<string, any[]>>(new Map());
const correctOptionIdByQ = ref<Map<string, string | null>>(new Map());
const correctBlanksByQ = ref<Map<string, Map<number, string[]>>>(new Map());
const correctTextAnswersByQ = ref<Map<string, string[]>>(new Map());

// matching
const matchingOptionsByQ = ref<Map<string, any[]>>(new Map());
const matchingItemsByQ = ref<Map<string, any[]>>(new Map());

function initAnswerDefaults(allQuestions: ListeningQuestion[]) {
  for (const q of allQuestions) {
    const text = q.question_text ?? "";

    // ✅ если есть {{1}} / {{2}} — создаём ответы для каждого blank
    if (hasBlanks(text)) {
      const matches = [...String(text).matchAll(/\{\{(\d+)\}\}/g)];
      for (const m of matches) {
        const idx = Number(m[1]);
        const key = blankKey(q.id, idx);
        if (answers.value[key] === undefined) answers.value[key] = "";
      }
      continue;
    }

    // старое поведение для остальных типов
    const qType = (q.question_type || "") as QType;

    if (qType === "multiple_choice") {
      if (answers.value[q.id] === undefined) answers.value[q.id] = null;
      continue;
    }

    if (qType === "matching") {
      const items = matchingItemsByQ.value.get(q.id) || [];
      for (const it of items) {
        const key = `match:${it.id}`;
        if (answers.value[key] === undefined) answers.value[key] = null;
      }
      continue;
    }

    if (answers.value[q.id] === undefined) answers.value[q.id] = "";
  }
}

function buildGlobalNumbers(secs: ListeningSection[]) {
  const flat: ListeningQuestion[] = [];
  for (const s of secs) {
    const sorted = [...(s.listening_questions || [])].sort(
        (a, b) => safeNumber(a.order_number) - safeNumber(b.order_number)
    );
    s.listening_questions = sorted;
    flat.push(...sorted);
  }

  flat.forEach((q, idx) => (q.global_number = idx + 1));
  return { flat, total: flat.length };
}

// -------------------- AUDIO HELPERS --------------------
async function resolveAudioUrl(raw: string): Promise<string> {
  if (!raw) return "";

  // already full url
  if (/^https?:\/\//i.test(raw)) return raw;

  // bucket path
  const path = raw.replace(/^\/+/, "");

  if (!AUDIO_BUCKET_PRIVATE) {
    const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path);
    return data?.publicUrl || "";
  }

  const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(path, 60 * 60);

  if (error) throw error;
  return data.signedUrl;
}

watch(
    () => playableAudioUrl.value,
    (url) => {
      audioError.value = "";
      if (!url) return;
    }
);

// -------------------- LOAD LISTENING --------------------
async function loadListening() {
  loading.value = true;
  error.value = "";
  started.value = false;
  stopTimer();

  playableAudioUrl.value = "";
  audioError.value = "";

  try {
    const row = await loadStudentTestRow();
    studentTest.value = row;

    if (row.status !== "listening") {
      router.push("/student");
      return;
    }
    if (!row.listening_test_id) throw new Error("listening_test_id is NULL in student_tests");

    // 1) listening test
    const { data: listeningTest, error: testErr } = await supabase
        .from("listening_tests")
        .select("*")
        .eq("id", row.listening_test_id)
        .single();

    if (testErr) throw testErr;
    test.value = listeningTest;

    // ✅ resolve audio url from DB
    if (listeningTest?.audio_url) {
      try {
        playableAudioUrl.value = await resolveAudioUrl(listeningTest.audio_url);
        if (!playableAudioUrl.value) {
          audioError.value =
              `Audio not resolved.\nDB audio_url должен быть PATH:\nfolder/file.mp3\nв bucket "${AUDIO_BUCKET}"`;
        }
      } catch (e: any) {
        audioError.value = e?.message || "Failed to resolve audio url";
      }
    } else {
      audioError.value = "audio_url пустой в listening_tests.audio_url";
    }

    // ✅ time in minutes => seconds
    const minutes = safeNumber(listeningTest.duration, 40);
    timeLeft.value = Math.max(1, minutes * 60);

    // 2) sections + questions
    const { data: secs, error: secErr } = await supabase
        .from("listening_sections")
        .select(
            `
          id,
          content,
          title,
          content,
          order_number,
          section_number,
          image_url,
          part_number,
          question_type,
          listening_questions (
            id,
            order_number,
            question_text,
            question_type
          )
        `
        )
        .eq("test_id", row.listening_test_id)
        .order("part_number", { ascending: true })
        .order("order_number", { ascending: true });

    if (secErr) throw secErr;

    const mapped: ListeningSection[] = (secs || []).map((s: any) => ({
      id: s.id,
      title: s.title ?? "",
      content: s.content ?? "",
      order_number: s.order_number ?? null,
      image_url: s.image_url ?? null,
      part_number: s.part_number ?? null,
      section_number: s.section_number ?? null,
      question_type: s.question_type ?? null,
      listening_questions: (s.listening_questions || []).map((q: any) => ({
        id: q.id,
        order_number: q.order_number ?? null,
        question_text: q.question_text ?? "",
        question_type: q.question_type ?? null,
      })),
    }));

    sections.value = mapped;
    await Promise.all(
        sections.value.map(async (s) => {
          if (!s.image_url) return;
          try {
            s.imagePreview = await resolveSectionImageUrl(s.image_url);
          } catch (e) {
            s.imagePreview = null;
          }
        })
    );

    for (const s of sections.value) {
      for (const q of s.listening_questions) {
        if (!q.question_type) q.question_type = s.question_type || "note_completion";
      }
    }

    const allQuestions = sections.value.flatMap((s) => s.listening_questions);
    const qIds = allQuestions.map((q) => q.id);

    buildGlobalNumbers(sections.value);

    if (qIds.length) {
      const [ansRes, optRes, miRes, moRes] = await Promise.all([
        supabase.from("listening_answers").select("*").in("question_id", qIds),
        supabase.from("listening_options").select("*").in("question_id", qIds),
        supabase.from("listening_matching_items").select("*").in("question_id", qIds),
        supabase.from("listening_matching_options").select("*").in("question_id", qIds),
      ]);

      // ---- answers (text) ----
      // const ansRows = ansRes.error ? [] : ansRes.data || [];
      // const mapText = new Map<string, string[]>();
      // for (const a of ansRows) {
      //   const qid = a.question_id;
      //   const txt = (a.correct_answer ?? a.answer_text ?? a.text ?? "").toString().trim();
      //   if (!txt) continue;
      //   const arr = mapText.get(qid) || [];
      //   arr.push(txt);
      //   mapText.set(qid, arr);
      // }
      // correctTextAnswersByQ.value = mapText;

      // ---- answers (text + blanks) ----
      const ansRows = ansRes.error ? [] : ansRes.data || [];

// 1) обычные ответы (если вопрос НЕ с {{n}})
      const mapText = new Map<string, string[]>();

// 2) ответы для blanks: question_id -> blankIndex -> [answers]
      const mapBlanks = new Map<string, Map<number, string[]>>();

// helper
      const pickBlankIndex = (a: any): number | null => {
        const raw =
            a.blank_index ??
            a.blank_number ??
            a.blank_no ??
            a.answer_number ??
            a.order_number ??
            a.position ??
            null;

        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      };

      for (const a of ansRows) {
        const qid = a.question_id;
        const txt = (a.correct_answer ?? a.answer_text ?? a.text ?? "")
            .toString()
            .trim();

        if (!qid || !txt) continue;

        const blankIdx = pickBlankIndex(a);

        // ✅ если у answer есть blank_index / order_number -> это ответ для {{n}}
        if (blankIdx != null) {
          const qMap = mapBlanks.get(qid) || new Map<number, string[]>();
          const arr = qMap.get(blankIdx) || [];
          arr.push(txt);
          qMap.set(blankIdx, arr);
          mapBlanks.set(qid, qMap);
          continue;
        }

        // иначе считаем как обычный текстовый ответ
        const arr = mapText.get(qid) || [];
        arr.push(txt);
        mapText.set(qid, arr);
      }

      correctTextAnswersByQ.value = mapText;
      correctBlanksByQ.value = mapBlanks;


      // ---- options (mcq) ----
      const optRows = optRes.error ? [] : optRes.data || [];
      const mapOpt = new Map<string, any[]>();
      const correctOpt = new Map<string, string | null>();

      for (const o of optRows) {
        const qid = o.question_id;
        const arr = mapOpt.get(qid) || [];
        arr.push(o);
        mapOpt.set(qid, arr);
        if (o.is_correct) correctOpt.set(qid, o.id);
      }

      for (const [qid, arr] of mapOpt.entries()) {
        arr.sort((a, b) => String(a.option_label ?? "").localeCompare(String(b.option_label ?? "")));
        mapOpt.set(qid, arr);
      }

      optionsByQ.value = mapOpt;
      correctOptionIdByQ.value = correctOpt;

      // ---- matching ----
      const miRows = miRes.error ? [] : miRes.data || [];
      const moRows = moRes.error ? [] : moRes.data || [];

      const mapMI = new Map<string, any[]>();
      for (const it of miRows) {
        const qid = it.question_id;
        const arr = mapMI.get(qid) || [];
        arr.push(it);
        mapMI.set(qid, arr);
      }

      const mapMO = new Map<string, any[]>();
      for (const op of moRows) {
        const qid = op.question_id;
        const arr = mapMO.get(qid) || [];
        arr.push(op);
        mapMO.set(qid, arr);
      }

      for (const [qid, arr] of mapMO.entries()) {
        arr.sort((a, b) => String(a.option_label ?? "").localeCompare(String(b.option_label ?? "")));
        mapMO.set(qid, arr);
      }

      matchingItemsByQ.value = mapMI;
      matchingOptionsByQ.value = mapMO;
    }

    initAnswerDefaults(allQuestions);

    window.addEventListener("beforeunload", preventLeave);
  } catch (e: any) {
    console.error(e);
    error.value = e?.message || "Failed to load listening test";
  } finally {
    loading.value = false;
  }
}

// ------ Start attempt ------
async function startAttempt() {
  if (started.value) return;

  if (!playableAudioUrl.value) {
    error.value =
        `Audio недоступно.\nПроверь listening_tests.audio_url:\nfolder/file.mp3\nв bucket "${AUDIO_BUCKET}".`;
    return;
  }

  if (audioError.value) {
    error.value = "Нельзя начать тест из-за аудио: " + audioError.value;
    return;
  }

  started.value = true;
  startTimer();

  if (studentTest.value?.id) {
    await supabase
        .from("student_tests")
        .update({ listening_started_at: new Date().toISOString() })
        .eq("id", studentTest.value.id);
  }

  // ✅ пытаемся запустить проигрывание (после user gesture)
  try {
    await audioPlayerRef.value?.play();
  } catch {}
}

// ------ Scoring ------
function normalizeText(s: string) {
  return (s || "").trim().toLowerCase();
}


function calcListeningScore(): number {
  const allQuestions = sections.value.flatMap((s) => s.listening_questions);
  let score = 0;

  for (const q of allQuestions) {
    const type = (q.question_type || "note_completion") as QType;
    const qText = q.question_text ?? "";

    // ✅ MULTIPLE CHOICE
    if (type === "multiple_choice") {
      const chosen = answers.value[q.id];
      const correct = correctOptionIdByQ.value.get(q.id) || null;
      if (chosen && correct && chosen === correct) score += 1;
      continue;
    }

    // ✅ MATCHING
    if (type === "matching") {
      const items = matchingItemsByQ.value.get(q.id) || [];
      for (const it of items) {
        const key = `match:${it.id}`;
        const chosen = answers.value[key];
        const correct = it.correct_option_id ?? null;
        if (chosen && correct && chosen === correct) score += 1;
      }
      continue;
    }

    // ✅ NOTE_COMPLETION with {{1}}, {{2}} ...
    if (hasBlanks(qText)) {
      const tokens = parseBlanks(qText);
      const blankIndexes = Array.from(
          new Set(tokens.filter(t => t.type === "blank").map((t: any) => Number(t.index)))
      ).sort((a, b) => a - b);

      for (const idx of blankIndexes) {
        const userVal = normalizeText(String(answers.value[blankKey(q.id, idx)] || ""));
        if (!userVal) continue;

        const correctListRaw = correctBlanksByQ.value.get(q.id)?.get(idx) || [];
        const correctList = correctListRaw.map(normalizeText);

        if (correctList.length && correctList.includes(userVal)) {
          score += 1; // ✅ каждый blank = 1 балл
        }
      }

      continue;
    }

    // ✅ other text questions (short_answer / sentence_completion etc)
    const typed = normalizeText(String(answers.value[q.id] || ""));
    if (!typed) continue;

    const correctList = (correctTextAnswersByQ.value.get(q.id) || []).map(normalizeText);
    if (correctList.length && correctList.includes(typed)) score += 1;
  }

  return score;
}
// function calcListeningScore(): number {
//   const allQuestions = sections.value.flatMap((s) => s.listening_questions);
//   let score = 0;
//
//   for (const q of allQuestions) {
//     const type = (q.question_type || "note_completion") as QType;
//
//     if (type === "multiple_choice") {
//       const chosen = answers.value[q.id];
//       const correct = correctOptionIdByQ.value.get(q.id) || null;
//       if (chosen && correct && chosen === correct) score += 1;
//       continue;
//     }
//
//     if (type === "matching") {
//       const items = matchingItemsByQ.value.get(q.id) || [];
//       for (const it of items) {
//         const key = `match:${it.id}`;
//         const chosen = answers.value[key];
//         const correct = it.correct_option_id ?? null;
//         if (chosen && correct && chosen === correct) score += 1;
//       }
//       continue;
//     }
//
//     const typed = normalizeText(String(answers.value[q.id] || ""));
//     if (!typed) continue;
//
//     const correctList = (correctTextAnswersByQ.value.get(q.id) || []).map(normalizeText);
//     if (correctList.length && correctList.includes(typed)) score += 1;
//   }
//
//   return score;
// }

async function resolveSectionImageUrl(raw: string): Promise<string> {
  if (!raw) return "";

  // если уже полный url
  if (/^https?:\/\//i.test(raw)) return raw;

  const path = raw.replace(/^\/+/, "");

  // PUBLIC bucket
  if (!SECTION_IMAGES_PRIVATE) {
    const { data } = supabase.storage.from(SECTION_IMAGES_BUCKET).getPublicUrl(path);
    return data?.publicUrl || "";
  }

  // PRIVATE bucket
  const { data, error } = await supabase.storage
      .from(SECTION_IMAGES_BUCKET)
      .createSignedUrl(path, 60 * 60);

  if (error) throw error;
  return data.signedUrl;
}

// --- Matching Drag & Drop state ---
const selectedOptionByQ = ref<Record<string, string | null>>({}); // qId -> optionId
const draggingOptionId = ref<string | null>(null);               // optionId
const draggingQuestionId = ref<string | null>(null);             // qId
const dragOverItemKey = ref<string | null>(null);                // `${qId}:${itemId}`

function selectOption(qId: string, optionId: string) {
  selectedOptionByQ.value[qId] = optionId;
}

function isOptionSelected(qId: string, optionId: string) {
  return selectedOptionByQ.value[qId] === optionId;
}

function clearItemMatch(itemId: string) {
  answers.value[`match:${itemId}`] = null;
}

// when user clicks on empty "Drop answer"
function applySelectedOptionToItem(qId: string, itemId: string) {
  const optId = selectedOptionByQ.value[qId];
  if (!optId) return; // nothing selected
  answers.value[`match:${itemId}`] = optId;
}

// Find option object by id (for chip)
function findOption(qId: string, optionId: string) {
  const list = matchingOptionsByQ.value.get(qId) || [];
  return list.find((x: any) => x.id === optionId) || null;
}

function getSelectedOption(qId: string, itemId: string) {
  const chosen = answers.value[`match:${itemId}`];
  if (!chosen) return null;
  return findOption(qId, chosen);
}

// Drag events
function onDragStartOption(qId: string, optionId: string) {
  draggingQuestionId.value = qId;
  draggingOptionId.value = optionId;
  // also set selected on drag start (nice UX)
  selectedOptionByQ.value[qId] = optionId;
}

function onDragEndOption() {
  draggingQuestionId.value = null;
  draggingOptionId.value = null;
  dragOverItemKey.value = null;
}

function onDragOverItem(qId: string, itemId: string) {
  dragOverItemKey.value = `${qId}:${itemId}`;
}

function onDragLeaveItem(qId: string, itemId: string) {
  const key = `${qId}:${itemId}`;
  if (dragOverItemKey.value === key) dragOverItemKey.value = null;
}

function isItemDragOver(qId: string, itemId: string) {
  return dragOverItemKey.value === `${qId}:${itemId}`;
}

function onDropOnItem(qId: string, itemId: string) {
  // only accept same question drag
  if (draggingQuestionId.value !== qId) return;

  const optId = draggingOptionId.value;
  if (!optId) return;

  answers.value[`match:${itemId}`] = optId;

  // cleanup
  dragOverItemKey.value = null;
}
// ------ Submit ------
async function submitListening(auto = false) {
  if (saving.value) return;
  saving.value = true;

  try {
    stopTimer();

    if (!studentTest.value?.id) throw new Error("student_test not loaded");

    const score = calcListeningScore();
    console.log("answers", answers.value);
    console.log("correctBlanksByQ", correctBlanksByQ.value);
    console.log("correctTextAnswersByQ", correctTextAnswersByQ.value);
    console.log("SCORE =>", score);

    const { error: upErr } = await supabase
        .from("student_tests")
        .update({
          listening_finished_at: new Date().toISOString(),
          listening_score: score,
          status: "reading",
        })
        .eq("id", studentTest.value.id);

    if (upErr) throw upErr;

    router.push("/");
  } catch (e: any) {
    console.error(e);
    error.value = e?.message || "Submit failed";
    if (started.value) startTimer();
  } finally {
    saving.value = false;
  }
}

const totalQuestions = computed(() =>
    sections.value.reduce((acc, s) => acc + (s.listening_questions?.length || 0), 0)
);
// -------------------- PART PAGINATION --------------------
type PartGroup = {
  partNumber: number;
  sections: ListeningSection[];
};

const currentPartIndex = ref(0);

// группируем секции по part (section_number если есть, иначе — по порядку)

const parts = computed<PartGroup[]>(() => {
  const src = [...(sections.value || [])];

  // стабильная сортировка
  src.sort((a, b) => safeNumber(a.order_number) - safeNumber(b.order_number));

  const map = new Map<number, ListeningSection[]>();

  src.forEach((s) => {
    const partNo = safeNumber((s as any).part_number, 1); // ✅ part_number
    const arr = map.get(partNo) || [];
    arr.push(s);
    map.set(partNo, arr);
  });

  const out: PartGroup[] = [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([partNumber, secs]) => ({
        partNumber,
        sections: secs.sort((a, b) => safeNumber(a.order_number) - safeNumber(b.order_number)),
      }));

  return out.length ? out : [{ partNumber: 1, sections: [] }];
});

// const parts = computed<PartGroup[]>(() => {
//   const src = [...(sections.value || [])];
//
//   // сортируем секции стабильно
//   src.sort((a, b) => safeNumber(a.order_number) - safeNumber(b.order_number));
//
//   // если хотя бы у одной секции есть section_number — используем его как Part
//   const hasPartNumbers = src.some((s) => Number.isFinite(Number(s.section_number)));
//
//   const map = new Map<number, ListeningSection[]>();
//
//   src.forEach((s, idx) => {
//     const partNo = hasPartNumbers
//         ? safeNumber(s.section_number, 1)
//         : 1; // если нет part-номеров — будет один part
//
//     const arr = map.get(partNo) || [];
//     arr.push(s);
//     map.set(partNo, arr);
//   });
//
//   // превратим в массив, отсортируем по номеру part
//   const out: PartGroup[] = [...map.entries()]
//       .sort((a, b) => a[0] - b[0])
//       .map(([partNumber, secs]) => ({
//         partNumber,
//         sections: secs.sort((a, b) => safeNumber(a.order_number) - safeNumber(b.order_number)),
//       }));
//
//   return out.length ? out : [{ partNumber: 1, sections: [] }];
// });

const totalParts = computed(() => parts.value.length);

const currentPart = computed<PartGroup>(() => {
  const idx = Math.min(Math.max(currentPartIndex.value, 0), totalParts.value - 1);
  return parts.value[idx] || { partNumber: 1, sections: [] };
});

const canPrevPart = computed(() => currentPartIndex.value > 0);
const canNextPart = computed(() => currentPartIndex.value < totalParts.value - 1);

function scrollToTopSmooth() {
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch {
    window.scrollTo(0, 0);
  }
}

function goPrevPart() {
  if (!canPrevPart.value) return;
  currentPartIndex.value--;
  scrollToTopSmooth();
}

function goNextPart() {
  if (!canNextPart.value) return;
  currentPartIndex.value++;
  scrollToTopSmooth();
}

// если parts изменились после загрузки — держим индекс в пределах
watch(totalParts, (n) => {
  if (n <= 0) currentPartIndex.value = 0;
  if (currentPartIndex.value > n - 1) currentPartIndex.value = n - 1;
});

onMounted(loadListening);

onBeforeUnmount(() => {
  stopTimer();
  window.removeEventListener("beforeunload", preventLeave);
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
    <!-- Sticky top -->
    <div class="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
              class="h-10 w-10 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-white flex items-center justify-center font-black"
          >
            I
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-extrabold text-gray-900">
              IELTS <span class="text-red-600 mr-1">Listening</span>
              <span class="text-sm text-gray-400 font-bold">({{ totalQuestions }}/40)</span>
            </h1>
            <p class="text-xs text-gray-500">One attempt • Listening → Reading → Writing</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="px-3 py-2 rounded-2xl border bg-white shadow-sm">
            <div class="text-[11px] text-gray-500 leading-none">Time left</div>
            <div class="text-lg font-mono font-extrabold text-red-600 leading-tight">
              ⏱ {{ formatTime(timeLeft) }}
            </div>
          </div>

          <button
              class="hidden sm:inline-flex px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold transition disabled:opacity-60"
              :disabled="loading || saving || !started"
              @click="submitListening(false)"
              title="Finish Listening"
          >
            <span v-if="saving">Submitting...</span>
            <span v-else>Finish</span>
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <!-- Loading -->
      <div v-if="loading" class="space-y-6">
        <div class="rounded-3xl border bg-white p-5 shadow-sm">
          <div class="h-4 w-44 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-12 mt-4 bg-gray-100 rounded-2xl animate-pulse"></div>
          <div class="h-3 w-72 mt-3 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div class="rounded-3xl border bg-white p-5 shadow-sm space-y-3">
          <div class="h-4 w-56 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-10 bg-gray-100 rounded-2xl animate-pulse"></div>
          <div class="h-10 bg-gray-100 rounded-2xl animate-pulse"></div>
          <div class="h-10 bg-gray-100 rounded-2xl animate-pulse"></div>
        </div>
        <p class="text-center text-sm text-gray-500">Loading listening data...</p>
      </div>

      <!-- Main Error -->
      <div v-else-if="error" class="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
        <div class="font-bold mb-1">Something went wrong</div>
        <div class="text-sm whitespace-pre-line">{{ error }}</div>

        <button
            class="mt-4 px-4 py-2 rounded-2xl bg-white border hover:bg-gray-50 font-semibold text-gray-800"
            @click="loadListening"
        >
          Retry
        </button>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6 mb-20">
        <!-- Start gate -->
        <div v-if="!started" class="rounded-3xl border border-gray-400/30 bg-white shadow-sm overflow-hidden mb-4">
          <div class="px-5 py-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div class="text-xs opacity-90">Important</div>
            <div class="text-lg font-extrabold mt-1">Start Listening attempt</div>
            <div class="text-xs opacity-90 mt-2">
              Timer will start only after you press <b>Start</b>. Don't refresh the page.
            </div>

            <div v-if="audioError" class="mt-2 p-2 bg-red-500/20 rounded-lg">
              <div class="text-xs font-bold whitespace-pre-line">⚠️ Audio Issue: {{ audioError }}</div>
            </div>
          </div>

          <div class="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="text-sm text-gray-600">
              <span v-if="!playableAudioUrl" class="text-red-600">
                Audio missing or wrong path in bucket "{{ AUDIO_BUCKET }}". Cannot start.
              </span>
              <span v-else-if="audioError" class="text-red-600">
                Audio issue detected. Fix it first.
              </span>
              <span v-else>
                Press Start to begin. If autoplay is blocked, press Play in the player.
              </span>
            </div>

            <button
                class="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold transition disabled:opacity-50 disabled:cursor-not-allowed"
                @click="startAttempt"
                :disabled="!playableAudioUrl || !!audioError"
            >
              ▶ Start
            </button>
          </div>
        </div>

        <!-- Audio Section -->
        <div class="rounded-3xl border bg-white shadow-sm overflow-hidden hidden">
          <div class="px-5 py-4 border-b bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
            <div>
              <div class="text-sm font-extrabold text-gray-900">Audio Player</div>
              <div class="text-xs text-gray-500">
                <span v-if="!started">Start the test first</span>
                <span v-else-if="audioError">{{ audioError }}</span>
                <span v-else>Ready</span>
              </div>
            </div>

            <span class="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              One attempt
            </span>
          </div>

          <div class="p-5">
            <div v-if="playableAudioUrl" class="space-y-3">
              <CAudioPlayer
                  ref="audioPlayerRef"
                  :src="playableAudioUrl"
                  :lockSeeking="true"
                  @ready="() => (audioError = '')"
                  @error="(msg: string) => (audioError = msg)"
              />
            </div>

            <div v-else class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-700">Audio file URL is not available</p>
            </div>

            <p class="text-xs text-gray-500 mt-3">Don't refresh the page. Your answers are saved in memory.</p>
          </div>
        </div>

        <!-- Sections + questions -->
        <div
            v-for="(section, sIndex) in currentPart.sections"
            :key="section.id"
            class="rounded-3xl border bg-white shadow-sm overflow-hidden border-gray-400/30 mb-4"
        >
          <div class="px-5 py-4 border-b border-gray-400/30 bg-gradient-to-r relative from-indigo-50 to-white flex items-start justify-between gap-3">
            <div class="w-full">
              <div class="flex items-center justify-between mb-4">
                <div class="text-lg font-extrabold text-gray-900">
                  Part {{ currentPart.partNumber }}
                </div>
                <div class="text-sm text-gray-500 font-semibold">
                  {{ currentPartIndex + 1 }} / {{ totalParts }}
                </div>
              </div>
              <div class="text-md text-indigo-700 font-bold" >
                Section {{ section.order_number ?? section.section_number ?? (sIndex + 1) }}
              </div>
              <h2 class="text-xl font-extrabold text-gray-900 mt-1">
                {{ section.title || "—" }}
              </h2>
              <p class="text-bold bg-blue-300 px-4 py-2 my-4">{{section?.content}}</p>
<!--              <div class="text-xs text-gray-500 mt-1">-->
<!--                Type: <b>{{ section.question_type || "note_completion" }}</b>-->
<!--              </div>-->
            </div>

            <span class="text-xs px-3 py-1 rounded-full border bg-white text-gray-700 font-semibold absolute right-5">
              {{ section.listening_questions?.length || 0 }} Q
            </span>
          </div>
          <div class="p-5 space-y-3">
              <img v-if="section.image_url"
                  :src="section.image_url"
                   class="w-full max-h-[420px] object-contain rounded-2xl border border-gray-400/30 bg-white"
                   loading="lazy"
                  alt="Section Image">
              <div v-for="q in section.listening_questions"
                   :key="q.id"
                   class="rounded-2xl w-full border bg-gray-50 border-gray-400/30 p-4 my-4"
                   :id="questionDomId(q.global_number)"
              >
                <div class="flex items-center justify-between gap-3 mb-2">
                  <div class="text-sm font-extrabold text-gray-900">Question {{ q.global_number }}</div>
<!--                  <span class="text-[11px] px-2.5 py-1 rounded-full border font-bold bg-[#8EC5FF] text-white">-->
<!--                  {{ q.question_type || section.question_type || "note_completion" }}-->
<!--                </span>-->
                </div>

                <div
                    v-if="
                  (q.question_type || section.question_type) !== 'multiple_choice' &&
                  (q.question_type || section.question_type) !== 'matching'
                "
                >
                  <div class="text-sm text-gray-700 mb-3 whitespace-pre-line leading-7">
                    <template v-for="(t, i) in parseBlanks(q.question_text)" :key="i">
                      <span v-if="t.type === 'text'">{{ t.value }}</span>

                      <input
                          v-else
                          v-model="answers[blankKey(q.id, t.index)]"
                          type="text"
                          class="inline-block align-middle mx-1 px-2 py-1 border-gray-400/30 w-44 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          :placeholder="`Answer ${t.index}`"
                      />
                    </template>
                  </div>

                  <!-- Если в тексте НЕТ {{n}}, показываем обычный input снизу -->
                  <input
                      v-if="!hasBlanks(q.question_text)"
                      v-model="answers[q.id]"
                      type="text"
                      class="w-full sm:w-[420px] px-3 py-2 rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your answer"
                  />

                </div>

                <div v-else-if="(q.question_type || section.question_type) === 'multiple_choice'">
                  <div class="text-sm text-gray-700 mb-3 whitespace-pre-line">{{ q.question_text }}</div>

                  <div class="space-y-2">
                    <label
                        v-for="opt in optionsByQ.get(q.id) || []"
                        :key="opt.id"
                        class="flex items-start my-2 gap-3 p-3 rounded-2xl border bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <input type="radio" :name="`mcq-${q.id}`" class="mt-1" :value="opt.id" v-model="answers[q.id]" />
                      <div class="text-sm text-gray-800">
                        <span class="font-extrabold mr-2">{{ opt.option_label }}.</span>
                        {{ opt.option_text }}
                      </div>
                    </label>

                    <div
                        v-if="!(optionsByQ.get(q.id) || []).length"
                        class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-3"
                    >
                      No options found for this question. Check <b>listening_options</b>.
                    </div>
                  </div>
                </div>

<!--                <div v-else>-->
<!--                  <div class="text-sm text-gray-700 mb-3 whitespace-pre-line">{{ q.question_text }}</div>-->

<!--                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">-->
<!--                    <div class="rounded-2xl border bg-white p-3">-->
<!--                      <div class="text-xs font-extrabold text-gray-900 mb-2">Items</div>-->

<!--                      <div-->
<!--                          v-for="it in matchingItemsByQ.get(q.id) || []"-->
<!--                          :key="it.id"-->
<!--                          class="flex items-center justify-between gap-3 py-2 border-b last:border-b-0"-->
<!--                      >-->
<!--                        <div class="text-sm text-gray-800 flex-1">-->
<!--                          {{ it.item_text || it.item_name || it.text || "—" }}-->
<!--                        </div>-->

<!--                        <select-->
<!--                            class="px-3 py-2 rounded-2xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"-->
<!--                            v-model="answers[`match:${it.id}`]"-->
<!--                        >-->
<!--                          <option :value="null">Select</option>-->
<!--                          <option v-for="op in matchingOptionsByQ.get(q.id) || []" :key="op.id" :value="op.id">-->
<!--                            {{ op.option_label }}. {{ op.option_text }}-->
<!--                          </option>-->
<!--                        </select>-->
<!--                      </div>-->

<!--                      <div-->
<!--                          v-if="!(matchingItemsByQ.get(q.id) || []).length"-->
<!--                          class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-3"-->
<!--                      >-->
<!--                        No matching items found. Check <b>listening_matching_items</b>.-->
<!--                      </div>-->
<!--                    </div>-->

<!--                    <div class="rounded-2xl border bg-white p-3">-->
<!--                      <div class="text-xs font-extrabold text-gray-900 mb-2">Options</div>-->
<!--                      <div class="space-y-2">-->
<!--                        <div-->
<!--                            v-for="op in matchingOptionsByQ.get(q.id) || []"-->
<!--                            :key="op.id"-->
<!--                            class="rounded-2xl border bg-gray-50 p-3 text-sm text-gray-800"-->
<!--                        >-->
<!--                          <span class="font-extrabold mr-2">{{ op.option_label }}.</span>-->
<!--                          {{ op.option_text }}-->
<!--                        </div>-->

<!--                        <div-->
<!--                            v-if="!(matchingOptionsByQ.get(q.id) || []).length"-->
<!--                            class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-3"-->
<!--                        >-->
<!--                          No matching options found. Check <b>listening_matching_options</b>.-->
<!--                        </div>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                  </div>-->

<!--                  <p class="text-xs text-gray-500 mt-3">Choose one option for each item.</p>-->
<!--                </div>-->
                <!-- MATCHING (Drag & Drop like screenshot) -->
                <div v-else>
                  <div class="text-sm text-gray-700 mb-4 whitespace-pre-line">
                    {{ q.question_text }}
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- LEFT: Items -->
                    <div class="rounded-3xl border bg-white p-4">
                      <div class="flex items-center justify-between mb-3">
                        <div class="text-sm font-extrabold text-gray-900">Items</div>
                        <div class="text-xs text-gray-500">Drop option to the right box</div>
                      </div>

                      <div class="space-y-3">
                        <div
                            v-for="(it, idx) in (matchingItemsByQ.get(q.id) || [])"
                            :key="it.id"
                            class="flex items-center mb-3 last:mb-0 justify-between gap-4 rounded-2xl border bg-gray-50 p-4"
                        >
                          <!-- item text -->
                          <div class="flex items-center gap-3 min-w-0">
                            <div class="w-10 text-center font-extrabold text-gray-600">
                              {{ (it.item_number ?? it.order_number ?? (idx + 1)) }}.
                            </div>
                            <div class="text-sm font-semibold text-gray-900 truncate">
                              {{ it.item_text || it.item_name || it.text || "—" }}
                            </div>
                          </div>

                          <!-- drop zone -->
                          <div
                              class="shrink-0"
                              @dragover.prevent="onDragOverItem(q.id, it.id)"
                              @dragleave="onDragLeaveItem(q.id, it.id)"
                              @drop.prevent="onDropOnItem(q.id, it.id)"
                          >
                            <!-- selected chip -->
                            <button
                                v-if="getSelectedOption(q.id, it.id)"
                                type="button"
                                class="flex items-center gap-2 px-3 py-2 rounded-2xl border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold"
                                @click="clearItemMatch(it.id)"
                                title="Click to remove"
                            >
              <span class="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-600 text-white text-xs font-black">
                {{ getSelectedOption(q.id, it.id).option_label }}
              </span>
                              <span class="text-sm font-bold">
                {{ getSelectedOption(q.id, it.id).option_text }}
              </span>
                              <span class="text-emerald-700/70 font-black">×</span>
                            </button>

                            <!-- empty drop -->
                            <button
                                v-else
                                type="button"
                                class="px-4 py-2 rounded-2xl border-2 border-dashed text-sm font-bold transition
                     bg-white text-gray-400 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                                :class="isItemDragOver(q.id, it.id) ? 'border-indigo-500 text-indigo-700 bg-indigo-50' : ''"
                                @click="applySelectedOptionToItem(q.id, it.id)"
                            >
                              Drop answer
                            </button>
                          </div>
                        </div>

                        <div
                            v-if="!(matchingItemsByQ.get(q.id) || []).length"
                            class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-3"
                        >
                          No matching items found. Check <b>listening_matching_items</b>.
                        </div>
                      </div>
                    </div>

                    <!-- RIGHT: Options -->
                    <div class="rounded-3xl border bg-white p-4">
                      <div class="flex items-center justify-between mb-3">
                        <div class="text-sm font-extrabold text-gray-900">Options</div>
                        <div class="text-xs text-gray-500">Drag or click to select</div>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            v-for="op in (matchingOptionsByQ.get(q.id) || [])"
                            :key="op.id"
                            type="button"
                            draggable="true"
                            @dragstart="onDragStartOption(q.id, op.id)"
                            @dragend="onDragEndOption"
                            @click="selectOption(q.id, op.id)"
                            class="group flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-left font-bold transition"
                            :class="isOptionSelected(q.id, op.id)
            ? 'border-indigo-600 bg-indigo-600 text-white'
            : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 text-gray-800'"
                        >
                          <div class="flex items-center gap-3 min-w-0">
            <span
                class="inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black"
                :class="isOptionSelected(q.id, op.id) ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'"
            >
              {{ op.option_label }}
            </span>
                            <span class="truncate">{{ op.option_text }}</span>
                          </div>

                          <span
                              class="opacity-60 group-hover:opacity-100 transition text-xs font-black"
                              :class="isOptionSelected(q.id, op.id) ? 'text-white' : 'text-gray-500'"
                          >
            Drag
          </span>
                        </button>
                      </div>

                      <div
                          v-if="!(matchingOptionsByQ.get(q.id) || []).length"
                          class="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-3"
                      >
                        No matching options found. Check <b>listening_matching_options</b>.
                      </div>

                      <p class="text-xs text-gray-500 mt-4">
                        Tip: select an option, then click an item to assign (fast mode).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <CPartPagination
                  v-model="currentPartIndex"
                  :total="totalParts"
                  label="Part"
                  :disabled="loading || saving"
              />

          </div>
        </div>

        <!-- Submit -->
        <div
            class="rounded-3xl border bg-white p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div class="text-sm text-gray-600">
            After submitting you will move to <b>Reading</b>. (You can't open Reading before submit.)
          </div>

          <button
              class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold transition disabled:opacity-60"
              :disabled="saving || !started"
              @click="submitListening(false)"
          >
            <span v-if="saving">Submitting...</span>
            <span v-else>Submit Listening</span>
          </button>
        </div>
      </div>
    </div>
    <CQuestionPagination
        v-model="currentPartIndex"
        :parts="paginationParts"
        :disabled="loading || saving"
        position="bottom"
        @go="onGoToQuestion"
    />
  </div>
</template>
