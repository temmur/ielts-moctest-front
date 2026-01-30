<!--<template>-->
<!--  <teleport to="body">-->
<!--    <transition name="fade">-->
<!--      <div-->
<!--          v-if="modelValue"-->
<!--          class="fixed inset-0 z-[9999] flex items-center justify-center px-4"-->
<!--      >-->
<!--        &lt;!&ndash; Backdrop &ndash;&gt;-->
<!--        <div-->
<!--            class="absolute inset-0 bg-black/50 backdrop-blur-[2px]"-->
<!--            @click="close"-->
<!--        />-->

<!--        &lt;!&ndash; Modal &ndash;&gt;-->
<!--        <div-->
<!--            class="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden"-->
<!--        >-->
<!--          &lt;!&ndash; Header &ndash;&gt;-->
<!--          <div class="flex items-center justify-between border-b px-6 py-4">-->
<!--            <div>-->
<!--              <h2 class="text-xl font-semibold">Update Test</h2>-->
<!--              <p class="text-sm text-gray-500">-->
<!--                Edit title, instructions, sections, questions and answers-->
<!--              </p>-->
<!--            </div>-->

<!--            <div class="flex items-center gap-2">-->
<!--              <button-->
<!--                  class="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 active:scale-[0.98]"-->
<!--                  @click="close"-->
<!--              >-->
<!--                Cancel-->
<!--              </button>-->
<!--              <button-->
<!--                  class="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90 active:scale-[0.98]"-->
<!--                  @click="save"-->
<!--              >-->
<!--                Save changes-->
<!--              </button>-->
<!--            </div>-->
<!--          </div>-->

<!--          &lt;!&ndash; Body &ndash;&gt;-->
<!--          <div class="max-h-[75vh] overflow-auto p-6">-->
<!--            <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">-->
<!--              &lt;!&ndash; Left: Test meta &ndash;&gt;-->
<!--              <div class="lg:col-span-1 space-y-4">-->
<!--                <div class="rounded-2xl border p-4">-->
<!--                  <h3 class="mb-3 font-semibold">Test info</h3>-->

<!--                  <label class="block text-sm font-medium text-gray-700"-->
<!--                  >Test title</label-->
<!--                  >-->
<!--                  <input-->
<!--                      v-model.trim="draft.title"-->
<!--                      type="text"-->
<!--                      class="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"-->
<!--                      placeholder="e.g. Transport from Bayswater"-->
<!--                  />-->

<!--                  <div class="mt-3 grid grid-cols-2 gap-3">-->
<!--                    <div>-->
<!--                      <label class="block text-sm font-medium text-gray-700"-->
<!--                      >Type</label-->
<!--                      >-->
<!--                      <select-->
<!--                          v-model="draft.type"-->
<!--                          class="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"-->
<!--                      >-->
<!--                        <option value="reading">Reading</option>-->
<!--                        <option value="listening">Listening</option>-->
<!--                        <option value="writing">Writing</option>-->
<!--                      </select>-->
<!--                    </div>-->

<!--                    <div>-->
<!--                      <label class="block text-sm font-medium text-gray-700"-->
<!--                      >Section</label-->
<!--                      >-->
<!--                      <select-->
<!--                          v-model.number="draft.section"-->
<!--                          class="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"-->
<!--                      >-->
<!--                        <option :value="1">Section 1</option>-->
<!--                        <option :value="2">Section 2</option>-->
<!--                        <option :value="3">Section 3</option>-->
<!--                        <option :value="4">Section 4</option>-->
<!--                      </select>-->
<!--                    </div>-->
<!--                  </div>-->

<!--                  <div class="mt-3">-->
<!--                    <label class="block text-sm font-medium text-gray-700"-->
<!--                    >Question range (optional)</label-->
<!--                    >-->
<!--                    <input-->
<!--                        v-model.trim="draft.questionRange"-->
<!--                        type="text"-->
<!--                        class="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"-->
<!--                        placeholder="e.g. Questions 1–10"-->
<!--                    />-->
<!--                  </div>-->

<!--                  <div class="mt-3">-->
<!--                    <label class="block text-sm font-medium text-gray-700"-->
<!--                    >Instruction (optional)</label-->
<!--                    >-->
<!--                    <textarea-->
<!--                        v-model="draft.instruction"-->
<!--                        rows="4"-->
<!--                        class="mt-1 w-full resize-none rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"-->
<!--                        placeholder='e.g. Complete the notes below. Write no more than two words and/or a number...'-->
<!--                    />-->
<!--                  </div>-->

<!--                  <div class="mt-4 flex items-center justify-between gap-3">-->
<!--                    <div class="text-xs text-gray-500">-->
<!--                      Test ID: <span class="font-mono">{{ draft.id }}</span>-->
<!--                    </div>-->
<!--                    <button-->
<!--                        class="text-xs rounded-xl border px-3 py-2 hover:bg-gray-50 active:scale-[0.98]"-->
<!--                        @click="addBlock"-->
<!--                    >-->
<!--                      + Add block-->
<!--                    </button>-->
<!--                  </div>-->
<!--                </div>-->

<!--                <div class="rounded-2xl border p-4">-->
<!--                  <h3 class="mb-2 font-semibold">Quick validation</h3>-->

<!--                  <ul class="space-y-1 text-sm">-->
<!--                    <li class="flex items-center gap-2">-->
<!--                      <span-->
<!--                          class="h-2 w-2 rounded-full"-->
<!--                          :class="draft.title?.length ? 'bg-green-500' : 'bg-red-500'"-->
<!--                      />-->
<!--                      Title is required-->
<!--                    </li>-->

<!--                    <li class="flex items-center gap-2">-->
<!--                      <span-->
<!--                          class="h-2 w-2 rounded-full"-->
<!--                          :class="draft.blocks.length ? 'bg-green-500' : 'bg-red-500'"-->
<!--                      />-->
<!--                      At least 1 block-->
<!--                    </li>-->

<!--                    <li class="flex items-center gap-2">-->
<!--                      <span-->
<!--                          class="h-2 w-2 rounded-full"-->
<!--                          :class="totalQuestions > 0 ? 'bg-green-500' : 'bg-red-500'"-->
<!--                      />-->
<!--                      At least 1 question-->
<!--                    </li>-->
<!--                  </ul>-->

<!--                  <div class="mt-3 text-xs text-gray-500">-->
<!--                    Total questions: <span class="font-semibold">{{ totalQuestions }}</span>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->

<!--              &lt;!&ndash; Right: Blocks + Questions &ndash;&gt;-->
<!--              <div class="lg:col-span-2 space-y-4">-->
<!--                <div-->
<!--                    v-for="(block, bIndex) in draft.blocks"-->
<!--                    :key="block.id"-->
<!--                    class="rounded-2xl border p-4"-->
<!--                >-->
<!--                  <div class="flex items-center justify-between gap-3">-->
<!--                    <div>-->
<!--                      <h3 class="font-semibold">-->
<!--                        Block {{ bIndex + 1 }}-->
<!--                        <span class="text-xs text-gray-500">(optional title)</span>-->
<!--                      </h3>-->
<!--                      <p class="text-xs text-gray-500">-->
<!--                        You can split a test into multiple blocks (like IELTS: different tasks inside section).-->
<!--                      </p>-->
<!--                    </div>-->

<!--                    <div class="flex items-center gap-2">-->
<!--                      <button-->
<!--                          class="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50 active:scale-[0.98]"-->
<!--                          @click="addQuestion(bIndex)"-->
<!--                      >-->
<!--                        + Add question-->
<!--                      </button>-->

<!--                      <button-->
<!--                          class="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50 active:scale-[0.98]"-->
<!--                          @click="removeBlock(bIndex)"-->
<!--                          :disabled="draft.blocks.length === 1"-->
<!--                          :class="draft.blocks.length === 1 ? 'opacity-50 cursor-not-allowed' : ''"-->
<!--                      >-->
<!--                        Remove block-->
<!--                      </button>-->
<!--                    </div>-->
<!--                  </div>-->

<!--                  <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">-->
<!--                    <div>-->
<!--                      <label class="block text-sm font-medium text-gray-700">Block title</label>-->
<!--                      <input-->
<!--                          v-model.trim="block.title"-->
<!--                          type="text"-->
<!--                          class="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"-->
<!--                          placeholder="e.g. Complete the notes below"-->
<!--                      />-->
<!--                    </div>-->

<!--                    <div>-->
<!--                      <label class="block text-sm font-medium text-gray-700">Block subtitle</label>-->
<!--                      <input-->
<!--                          v-model.trim="block.subtitle"-->
<!--                          type="text"-->
<!--                          class="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"-->
<!--                          placeholder="e.g. Write no more than two words..."-->
<!--                      />-->
<!--                    </div>-->

<!--                    <div class="md:col-span-2">-->
<!--                      <label class="block text-sm font-medium text-gray-700">Block description</label>-->
<!--                      <textarea-->
<!--                          v-model="block.description"-->
<!--                          rows="3"-->
<!--                          class="mt-1 w-full resize-none rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"-->
<!--                          placeholder="Any extra text shown above questions..."-->
<!--                      />-->
<!--                    </div>-->
<!--                  </div>-->

<!--                  &lt;!&ndash; Questions &ndash;&gt;-->
<!--                  <div class="mt-4 space-y-3">-->
<!--                    <div-->
<!--                        v-for="(q, qIndex) in block.questions"-->
<!--                        :key="q.id"-->
<!--                        class="rounded-2xl bg-gray-50 p-4"-->
<!--                    >-->
<!--                      <div class="flex items-start justify-between gap-3">-->
<!--                        <div class="min-w-0">-->
<!--                          <div class="text-sm font-semibold">-->
<!--                            Question {{ qIndex + 1 }}-->
<!--                            <span class="text-xs text-gray-500">({{ q.type }})</span>-->
<!--                          </div>-->
<!--                          <div class="text-xs text-gray-500">-->
<!--                            ID: <span class="font-mono">{{ q.id }}</span>-->
<!--                          </div>-->
<!--                        </div>-->

<!--                        <div class="flex items-center gap-2">-->
<!--                          <select-->
<!--                              v-model="q.type"-->
<!--                              class="rounded-xl border bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black/20"-->
<!--                          >-->
<!--                            <option value="text">Text</option>-->
<!--                            <option value="mcq">MCQ</option>-->
<!--                            <option value="matching">Matching</option>-->
<!--                            <option value="truefalse">True/False/Not Given</option>-->
<!--                          </select>-->

<!--                          <button-->
<!--                              class="rounded-xl border px-3 py-2 text-xs hover:bg-white active:scale-[0.98]"-->
<!--                              @click="removeQuestion(bIndex, qIndex)"-->
<!--                              :disabled="block.questions.length === 1 && draft.blocks.length === 1"-->
<!--                              :class="(block.questions.length === 1 && draft.blocks.length === 1) ? 'opacity-50 cursor-not-allowed' : ''"-->
<!--                          >-->
<!--                            Remove-->
<!--                          </button>-->
<!--                        </div>-->
<!--                      </div>-->

<!--                      <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">-->
<!--                        <div class="md:col-span-2">-->
<!--                          <label class="block text-sm font-medium text-gray-700">Question</label>-->
<!--                          <textarea-->
<!--                              v-model="q.prompt"-->
<!--                              rows="2"-->
<!--                              class="mt-1 w-full resize-none rounded-xl border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"-->
<!--                              placeholder="Type the question text..."-->
<!--                          />-->
<!--                        </div>-->

<!--                        <div>-->
<!--                          <label class="block text-sm font-medium text-gray-700">Answer</label>-->
<!--                          <input-->
<!--                              v-model.trim="q.answer"-->
<!--                              type="text"-->
<!--                              class="mt-1 w-full rounded-xl border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"-->
<!--                              placeholder="Correct answer"-->
<!--                          />-->
<!--                        </div>-->

<!--                        <div>-->
<!--                          <label class="block text-sm font-medium text-gray-700">Points</label>-->
<!--                          <input-->
<!--                              v-model.number="q.points"-->
<!--                              type="number"-->
<!--                              min="0"-->
<!--                              class="mt-1 w-full rounded-xl border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black/20"-->
<!--                          />-->
<!--                        </div>-->

<!--                        &lt;!&ndash; MCQ Options &ndash;&gt;-->
<!--                        <div v-if="q.type === 'mcq'" class="md:col-span-2">-->
<!--                          <div class="flex items-center justify-between">-->
<!--                            <label class="block text-sm font-medium text-gray-700">Options</label>-->
<!--                            <button-->
<!--                                class="rounded-xl border bg-white px-3 py-2 text-xs hover:bg-gray-50 active:scale-[0.98]"-->
<!--                                @click="addOption(q)"-->
<!--                            >-->
<!--                              + Add option-->
<!--                            </button>-->
<!--                          </div>-->

<!--                          <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">-->
<!--                            <div-->
<!--                                v-for="(opt, oi) in q.options"-->
<!--                                :key="opt.id"-->
<!--                                class="flex items-center gap-2 rounded-xl border bg-white p-2"-->
<!--                            >-->
<!--                              <input-->
<!--                                  v-model.trim="opt.text"-->
<!--                                  class="w-full outline-none text-sm"-->
<!--                                  placeholder="Option text..."-->
<!--                              />-->
<!--                              <button-->
<!--                                  class="text-xs rounded-lg border px-2 py-1 hover:bg-gray-50 active:scale-[0.98]"-->
<!--                                  @click="removeOption(q, oi)"-->
<!--                                  :disabled="q.options.length <= 2"-->
<!--                                  :class="q.options.length <= 2 ? 'opacity-50 cursor-not-allowed' : ''"-->
<!--                              >-->
<!--                                ✕-->
<!--                              </button>-->
<!--                            </div>-->
<!--                          </div>-->

<!--                          <p class="mt-2 text-xs text-gray-500">-->
<!--                            Tip: set <b>Answer</b> to exact option text (или можешь хранить key — как тебе удобнее).-->
<!--                          </p>-->
<!--                        </div>-->

<!--                        &lt;!&ndash; Matching &ndash;&gt;-->
<!--                        <div v-if="q.type === 'matching'" class="md:col-span-2">-->
<!--                          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">-->
<!--                            <div class="rounded-2xl border bg-white p-3">-->
<!--                              <div class="flex items-center justify-between">-->
<!--                                <div class="text-sm font-medium">Items to match</div>-->
<!--                                <button-->
<!--                                    class="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50 active:scale-[0.98]"-->
<!--                                    @click="addPairItem(q, 'items')"-->
<!--                                >-->
<!--                                  + Add-->
<!--                                </button>-->
<!--                              </div>-->

<!--                              <div class="mt-2 space-y-2">-->
<!--                                <div-->
<!--                                    v-for="(it, ii) in q.matching.items"-->
<!--                                    :key="it.id"-->
<!--                                    class="flex items-center gap-2 rounded-xl border bg-gray-50 p-2"-->
<!--                                >-->
<!--                                  <input-->
<!--                                      v-model.trim="it.text"-->
<!--                                      class="w-full bg-transparent outline-none text-sm"-->
<!--                                      placeholder="Item text..."-->
<!--                                  />-->
<!--                                  <button-->
<!--                                      class="text-xs rounded-lg border bg-white px-2 py-1 hover:bg-gray-50 active:scale-[0.98]"-->
<!--                                      @click="removePairItem(q, 'items', ii)"-->
<!--                                      :disabled="q.matching.items.length <= 1"-->
<!--                                      :class="q.matching.items.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''"-->
<!--                                  >-->
<!--                                    ✕-->
<!--                                  </button>-->
<!--                                </div>-->
<!--                              </div>-->
<!--                            </div>-->

<!--                            <div class="rounded-2xl border bg-white p-3">-->
<!--                              <div class="flex items-center justify-between">-->
<!--                                <div class="text-sm font-medium">Options to match with</div>-->
<!--                                <button-->
<!--                                    class="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50 active:scale-[0.98]"-->
<!--                                    @click="addPairItem(q, 'options')"-->
<!--                                >-->
<!--                                  + Add-->
<!--                                </button>-->
<!--                              </div>-->

<!--                              <div class="mt-2 space-y-2">-->
<!--                                <div-->
<!--                                    v-for="(op, oi) in q.matching.options"-->
<!--                                    :key="op.id"-->
<!--                                    class="flex items-center gap-2 rounded-xl border bg-gray-50 p-2"-->
<!--                                >-->
<!--                                  <input-->
<!--                                      v-model.trim="op.text"-->
<!--                                      class="w-full bg-transparent outline-none text-sm"-->
<!--                                      placeholder="Option text..."-->
<!--                                  />-->
<!--                                  <button-->
<!--                                      class="text-xs rounded-lg border bg-white px-2 py-1 hover:bg-gray-50 active:scale-[0.98]"-->
<!--                                      @click="removePairItem(q, 'options', oi)"-->
<!--                                      :disabled="q.matching.options.length <= 2"-->
<!--                                      :class="q.matching.options.length <= 2 ? 'opacity-50 cursor-not-allowed' : ''"-->
<!--                                  >-->
<!--                                    ✕-->
<!--                                  </button>-->
<!--                                </div>-->
<!--                              </div>-->
<!--                            </div>-->
<!--                          </div>-->

<!--                          <p class="mt-2 text-xs text-gray-500">-->
<!--                            Для matching ты можешь хранить правильные ответы в поле <b>Answer</b>-->
<!--                            как JSON, например: {"1":"A","2":"C"} — или сделай отдельную структуру, как тебе удобнее.-->
<!--                          </p>-->
<!--                        </div>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                  </div>-->
<!--                </div>-->

<!--                <div v-if="!draft.blocks.length" class="rounded-2xl border p-6 text-center text-gray-500">-->
<!--                  No blocks yet.-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->

<!--          &lt;!&ndash; Footer &ndash;&gt;-->
<!--          <div class="border-t px-6 py-4 flex items-center justify-between">-->
<!--            <div class="text-xs text-gray-500">-->
<!--              <span class="font-semibold">Autosafe:</span> we edit a copy, original test won’t change until Save.-->
<!--            </div>-->

<!--            <div class="flex items-center gap-2">-->
<!--              <button-->
<!--                  class="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 active:scale-[0.98]"-->
<!--                  @click="resetFromProps"-->
<!--              >-->
<!--                Reset-->
<!--              </button>-->
<!--              <button-->
<!--                  class="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90 active:scale-[0.98]"-->
<!--                  @click="save"-->
<!--              >-->
<!--                Save changes-->
<!--              </button>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </transition>-->
<!--  </teleport>-->
<!--</template>-->

<!--<script setup>-->
<!--import { computed, reactive, watch } from "vue";-->

<!--const props = defineProps({-->
<!--  modelValue: { type: Boolean, default: false },-->
<!--  // тест который редактируем-->
<!--  test: {-->
<!--    type: Object,-->
<!--    required: true,-->
<!--    // ожидаем структуру (можешь адаптировать):-->
<!--    // {-->
<!--    //   id, title, type, section,-->
<!--    //   questionRange, instruction,-->
<!--    //   blocks: [-->
<!--    //     { id, title, subtitle, description, questions: [{id, type, prompt, answer, points, options, matching}] }-->
<!--    //   ]-->
<!--    // }-->
<!--  },-->
<!--});-->

<!--const emit = defineEmits(["update:modelValue", "save"]);-->

<!--const uid = () =>-->
<!--    (crypto?.randomUUID?.() || `id_${Math.random().toString(16).slice(2)}_${Date.now()}`);-->

<!--function deepClone(obj) {-->
<!--  return JSON.parse(JSON.stringify(obj ?? {}));-->
<!--}-->

<!--function normalizeTest(t) {-->
<!--  const base = deepClone(t);-->

<!--  base.id ??= uid();-->
<!--  base.title ??= "";-->
<!--  base.type ??= "reading";-->
<!--  base.section ??= 1;-->
<!--  base.questionRange ??= "";-->
<!--  base.instruction ??= "";-->

<!--  if (!Array.isArray(base.blocks) || base.blocks.length === 0) {-->
<!--    base.blocks = [makeBlock()];-->
<!--  } else {-->
<!--    base.blocks = base.blocks.map((b) => normalizeBlock(b));-->
<!--  }-->
<!--  return base;-->
<!--}-->

<!--function makeQuestion() {-->
<!--  return {-->
<!--    id: uid(),-->
<!--    type: "text",-->
<!--    prompt: "",-->
<!--    answer: "",-->
<!--    points: 1,-->
<!--    options: [-->
<!--      { id: uid(), text: "" },-->
<!--      { id: uid(), text: "" },-->
<!--    ],-->
<!--    matching: {-->
<!--      items: [{ id: uid(), text: "" }],-->
<!--      options: [-->
<!--        { id: uid(), text: "" },-->
<!--        { id: uid(), text: "" },-->
<!--      ],-->
<!--    },-->
<!--  };-->
<!--}-->

<!--function makeBlock() {-->
<!--  return {-->
<!--    id: uid(),-->
<!--    title: "",-->
<!--    subtitle: "",-->
<!--    description: "",-->
<!--    questions: [makeQuestion()],-->
<!--  };-->
<!--}-->

<!--function normalizeBlock(b) {-->
<!--  const nb = deepClone(b);-->
<!--  nb.id ??= uid();-->
<!--  nb.title ??= "";-->
<!--  nb.subtitle ??= "";-->
<!--  nb.description ??= "";-->
<!--  if (!Array.isArray(nb.questions) || nb.questions.length === 0) {-->
<!--    nb.questions = [makeQuestion()];-->
<!--  } else {-->
<!--    nb.questions = nb.questions.map((q) => normalizeQuestion(q));-->
<!--  }-->
<!--  return nb;-->
<!--}-->

<!--function normalizeQuestion(q) {-->
<!--  const nq = deepClone(q);-->
<!--  nq.id ??= uid();-->
<!--  nq.type ??= "text";-->
<!--  nq.prompt ??= "";-->
<!--  nq.answer ??= "";-->
<!--  nq.points ??= 1;-->

<!--  if (!Array.isArray(nq.options) || nq.options.length < 2) {-->
<!--    nq.options = [-->
<!--      { id: uid(), text: "" },-->
<!--      { id: uid(), text: "" },-->
<!--    ];-->
<!--  } else {-->
<!--    nq.options = nq.options.map((o) => ({ id: o?.id ?? uid(), text: o?.text ?? "" }));-->
<!--  }-->

<!--  nq.matching ??= {};-->
<!--  nq.matching.items ??= [{ id: uid(), text: "" }];-->
<!--  nq.matching.options ??= [-->
<!--    { id: uid(), text: "" },-->
<!--    { id: uid(), text: "" },-->
<!--  ];-->

<!--  nq.matching.items = nq.matching.items.map((it) => ({ id: it?.id ?? uid(), text: it?.text ?? "" }));-->
<!--  nq.matching.options = nq.matching.options.map((op) => ({ id: op?.id ?? uid(), text: op?.text ?? "" }));-->

<!--  return nq;-->
<!--}-->

<!--const draft = reactive(normalizeTest(props.test));-->

<!--function resetFromProps() {-->
<!--  const fresh = normalizeTest(props.test);-->
<!--  Object.keys(draft).forEach((k) => delete draft[k]);-->
<!--  Object.assign(draft, fresh);-->
<!--}-->

<!--watch(-->
<!--    () => props.test,-->
<!--    () => {-->
<!--      resetFromProps();-->
<!--    },-->
<!--    { deep: true }-->
<!--);-->

<!--watch(-->
<!--    () => props.modelValue,-->
<!--    (open) => {-->
<!--      if (open) resetFromProps();-->
<!--    }-->
<!--);-->

<!--const totalQuestions = computed(() =>-->
<!--    draft.blocks.reduce((sum, b) => sum + (b.questions?.length || 0), 0)-->
<!--);-->

<!--function close() {-->
<!--  emit("update:modelValue", false);-->
<!--}-->

<!--function save() {-->
<!--  // минимальная валидация-->
<!--  if (!draft.title?.trim()) return;-->
<!--  if (!draft.blocks.length) return;-->
<!--  if (totalQuestions.value <= 0) return;-->

<!--  emit("save", deepClone(draft));-->
<!--  close();-->
<!--}-->

<!--function addBlock() {-->
<!--  draft.blocks.push(makeBlock());-->
<!--}-->

<!--function removeBlock(index) {-->
<!--  if (draft.blocks.length === 1) return;-->
<!--  draft.blocks.splice(index, 1);-->
<!--}-->

<!--function addQuestion(blockIndex) {-->
<!--  draft.blocks[blockIndex].questions.push(makeQuestion());-->
<!--}-->

<!--function removeQuestion(blockIndex, qIndex) {-->
<!--  const block = draft.blocks[blockIndex];-->
<!--  const isLastQuestionInAll =-->
<!--      draft.blocks.length === 1 && block.questions.length === 1;-->

<!--  if (isLastQuestionInAll) return;-->
<!--  if (block.questions.length === 1 && draft.blocks.length > 1) {-->
<!--    // если в блоке 1 вопрос и блоков много — удалим блок целиком-->
<!--    draft.blocks.splice(blockIndex, 1);-->
<!--    if (!draft.blocks.length) draft.blocks.push(makeBlock());-->
<!--    return;-->
<!--  }-->
<!--  block.questions.splice(qIndex, 1);-->
<!--}-->

<!--function addOption(q) {-->
<!--  q.options.push({ id: uid(), text: "" });-->
<!--}-->

<!--function removeOption(q, index) {-->
<!--  if (q.options.length <= 2) return;-->
<!--  q.options.splice(index, 1);-->
<!--}-->

<!--function addPairItem(q, key) {-->
<!--  q.matching[key].push({ id: uid(), text: "" });-->
<!--}-->

<!--function removePairItem(q, key, index) {-->
<!--  const min = key === "items" ? 1 : 2;-->
<!--  if (q.matching[key].length <= min) return;-->
<!--  q.matching[key].splice(index, 1);-->
<!--}-->
<!--</script>-->

<!--<style scoped>-->
<!--.fade-enter-active,-->
<!--.fade-leave-active {-->
<!--  transition: opacity 0.2s ease;-->
<!--}-->
<!--.fade-enter-from,-->
<!--.fade-leave-to {-->
<!--  opacity: 0;-->
<!--}-->
<!--</style>-->

<!-- UpdateTestModal.vue -->
<!-- UpdateTestModal.vue -->
<template>
  <teleport to="body">
    <!-- Body -->
    <div class="p-6 h-[78vh] overflow-y-auto">
      <!-- ✅ LOADING FULL TEST -->
      <div v-if="loadingFull" class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-gray-200 animate-pulse"></div>
          <div class="flex-1">
            <div class="h-4 w-56 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-3 w-40 bg-gray-100 rounded mt-2 animate-pulse"></div>
          </div>
        </div>

        <div class="border rounded-2xl p-5 bg-gray-50 space-y-3">
          <div class="h-4 w-44 bg-gray-200 rounded animate-pulse"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            <div class="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          <div class="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>

        <div class="border rounded-2xl p-5 bg-white space-y-3">
          <div class="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
          <div class="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
          <div class="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>

        <div class="text-center text-sm text-gray-500 pt-2">
          Loading test data...
        </div>
      </div>

      <!-- ✅ REAL FORM (only after load) -->
      <div v-else>
        <div v-if="error" class="mb-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
          {{ error }}
        </div>

        <!-- ✅ ВЕСЬ ТВОЙ СУЩЕСТВУЮЩИЙ КОД ФОРМЫ ОСТАВЬ ТУТ -->
        <!-- Test meta -->
        <div class="border rounded-2xl p-5 bg-gray-50">
          ...
        </div>

        <!-- Parts / Sections / Questions -->
        <div class="mt-6 space-y-6">
          ...
        </div>
      </div>
    </div>

    <div class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/50" @click="close" />

      <div class="relative w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 class="text-xl font-semibold">Edit {{ type }} test</h2>
            <p class="text-xs text-gray-500">ID: {{ local.id }}</p>
          </div>
          <button class="text-2xl leading-none text-gray-400 hover:text-gray-700" @click="close">
            &times;
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 h-[78vh] overflow-y-auto">
          <div v-if="error" class="mb-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
            {{ error }}
          </div>

          <!-- Test meta -->
          <div class="border rounded-2xl p-5 bg-gray-50">
            <h3 class="font-semibold text-gray-900 mb-4">Test Information</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                <input
                    v-model="local.title"
                    class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., IELTS Reading Academic Test 1"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                    v-model.number="local.duration"
                    type="number"
                    class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="60"
                />
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                  v-model="local.description"
                  rows="2"
                  class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional"
              />
            </div>

            <!-- Listening Audio -->
            <div v-if="type === 'listening'" class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Audio File</label>

              <div class="flex items-center gap-3">
                <input
                    type="file"
                    accept="audio/*"
                    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    @change="handleAudioUpload"
                />
                <span v-if="audioFile" class="text-xs text-green-700">New: {{ audioFile.name }}</span>
                <span v-else-if="local.audio_url" class="text-xs text-gray-500">Current audio exists</span>
                <span v-else class="text-xs text-gray-400">No audio uploaded</span>
              </div>
            </div>
          </div>

          <!-- Parts / Sections / Questions -->
          <div class="mt-6 space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Parts & Sections</h3>
              <button class="text-sm text-blue-600 hover:text-blue-800" @click="addPart">+ Add Part</button>
            </div>

            <div
                v-for="(part, partIndex) in local.parts"
                :key="part._key"
                class="border rounded-2xl p-5 bg-white"
            >
              <!-- Part header -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-semibold">
                    {{ partIndex + 1 }}
                  </div>
                  <div>
                    <div class="font-semibold text-gray-900">Part {{ partIndex + 1 }}</div>
                    <div class="text-xs text-gray-500">
                      {{ part.sections.length }} section{{ part.sections.length !== 1 ? "s" : "" }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button class="text-sm text-blue-600 hover:text-blue-800" @click="addSection(partIndex)">
                    + Add Section
                  </button>
                  <button
                      v-if="local.parts.length > 1"
                      class="text-sm text-red-600 hover:text-red-800"
                      @click="removePart(partIndex)"
                  >
                    Remove Part
                  </button>
                </div>
              </div>

              <!-- Part description -->
              <div class="mb-5">
                <label class="block text-sm font-medium text-gray-700 mb-1">Part Description (Optional)</label>
                <textarea
                    v-model="part.description"
                    rows="2"
                    class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., You will hear a conversation..."
                />
              </div>

              <!-- Sections -->
              <div class="space-y-6">
                <div
                    v-for="(section, sectionIndex) in part.sections"
                    :key="section._key"
                    class="border-l-4 border-blue-400 bg-blue-50/30 rounded-2xl p-4"
                >
                  <!-- Section header -->
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs">
                        {{ sectionIndex + 1 }}
                      </div>
                      <div class="font-semibold text-gray-900">Section {{ sectionIndex + 1 }}</div>
                    </div>

                    <button
                        v-if="part.sections.length > 1"
                        class="text-sm text-red-600 hover:text-red-800"
                        @click="removeSection(partIndex, sectionIndex)"
                    >
                      Remove
                    </button>
                  </div>

                  <!-- Section Title / Instruction -->
                  <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Section Title / Instruction</label>
                    <textarea
                        v-model="section.title"
                        rows="2"
                        class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Questions 1–10 Complete the notes below..."
                    />
                  </div>

                  <!-- Section Content / Context -->
                  <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Section Content / Context</label>
                    <textarea
                        v-model="section.content"
                        rows="3"
                        class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Read the passage / Listen to a conversation..."
                    />
                  </div>

                  <!-- Section Image -->
                  <div class="mb-4" v-if="type == 'listening'">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Section Image (Optional) <span class="text-xs text-gray-500">— diagram/map/chart</span>
                    </label>

                    <div class="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-white">
                      <div v-if="section.imagePreview" class="mb-3">
                        <img :src="section.imagePreview" class="max-h-56 mx-auto rounded-xl" alt="preview" />
                        <div class="text-xs text-gray-500 mt-2 text-center">
                          {{ section.imageFile ? "New image selected" : "Current image exists" }}
                        </div>
                      </div>
                      <div v-else class="text-center py-5">
                        <div class="text-4xl text-gray-300 mb-2">🖼️</div>
                        <div class="text-sm text-gray-500">No image</div>
                      </div>

                      <div class="mt-3 flex items-center justify-center gap-2">
                        <label
                            class="inline-flex items-center px-4 py-2 bg-white border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                              type="file"
                              accept="image/*"
                              class="hidden"
                              @change="(e) => handleSectionImageUpload(e, partIndex, sectionIndex)"
                          />
                          {{ section.imagePreview ? "Change Image" : "Upload Image" }}
                        </label>
                        <button
                            v-if="section.imagePreview"
                            class="px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                            @click="removeSectionImage(partIndex, sectionIndex)"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Question Type -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Question Type for this Section</label>
                    <div class="flex flex-wrap gap-2">
                      <button
                          v-for="qt in questionTypes"
                          :key="qt.id"
                          type="button"
                          class="px-3 py-2 text-sm border rounded-xl transition"
                          :class="section.questionType === qt.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'"
                          @click="setSectionQuestionType(partIndex, sectionIndex, qt.id)"
                      >
                        {{ qt.name }}
                      </button>
                    </div>
                  </div>

                  <!-- Questions -->
                  <div class="space-y-3">
                    <div
                        v-for="(question, qIndex) in section.questions"
                        :key="question._key"
                        class="border border-gray-200 bg-white rounded-2xl p-4"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <div class="font-medium text-gray-800">Question {{ qIndex + 1 }}</div>
                        <button
                            v-if="section.questions.length > 1"
                            class="text-sm text-red-600 hover:text-red-800"
                            @click="removeQuestion(partIndex, sectionIndex, qIndex)"
                        >
                          Remove
                        </button>
                      </div>

                      <!-- Question Text -->
                      <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                        <input
                            v-model="question.text"
                            class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :placeholder="section.questionType === 'note_completion'
                            ? 'Use {{1}}, {{2}} for blanks'
                            : getQuestionPlaceholder(section.questionType, qIndex)"
                        />
                      </div>

                      <!-- Note Completion Answers -->
                      <div v-if="section.questionType === 'note_completion'" class="mb-2">
                        <div class="flex items-center justify-between">
                          <label class="block text-sm font-medium text-gray-700">
                            Correct Answers (for {{1}}, {{2}} ...)
                          </label>
                          <button class="text-sm text-blue-600 hover:text-blue-800" type="button" @click="addBlank(question)">
                            + Add Answer
                          </button>
                        </div>

                        <div class="mt-2 space-y-2">
                          <div v-for="(ans, ansIndex) in question.answers" :key="ansIndex" class="flex items-center gap-2">
                            <div class="w-20 text-xs text-gray-500">
                              &#123;&#123;{{ ansIndex + 1 }}&#125;&#125;
                            </div>
                            <input
                                v-model="question.answers[ansIndex]"
                                class="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter correct word/number"
                            />
                            <button
                                v-if="question.answers.length > 1"
                                type="button"
                                class="px-3 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200"
                                @click="removeBlank(question, ansIndex)"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Multiple Choice -->
                      <div v-if="section.questionType === 'multiple_choice'" class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Options</label>

                        <div
                            v-for="(opt, optIndex) in question.options"
                            :key="opt._key"
                            class="flex items-center gap-3"
                        >
                          <div class="flex items-center">
                            <input
                                type="radio"
                                v-model="question.correctOption"
                                :value="opt.id"
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span class="ml-2 text-gray-700">{{ String.fromCharCode(65 + optIndex) }}.</span>
                          </div>

                          <input
                              v-model="opt.text"
                              class="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                              :placeholder="`Option ${String.fromCharCode(65 + optIndex)}`"
                          />

                          <button
                              v-if="question.options.length > 2"
                              type="button"
                              class="px-3 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200"
                              @click="removeOption(partIndex, sectionIndex, qIndex, optIndex)"
                          >
                            &times;
                          </button>
                        </div>

                        <button type="button" class="text-sm text-blue-600 hover:text-blue-800" @click="addOption(partIndex, sectionIndex, qIndex)">
                          + Add Option
                        </button>
                      </div>

                      <!-- Matching -->
                      <div v-if="section.questionType === 'matching'" class="space-y-3">
                        <label class="block text-sm font-medium text-gray-700">Matching Pairs</label>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <!-- Items -->
                          <div class="bg-white rounded-2xl border p-3">
                            <div class="flex items-center justify-between mb-2">
                              <label class="text-sm font-medium text-gray-700">Items</label>
                              <button type="button" class="text-sm text-blue-600 hover:text-blue-800" @click="addMatchingItem(partIndex, sectionIndex, qIndex)">
                                + Add Item
                              </button>
                            </div>

                            <div v-for="(it, itemIndex) in question.matchingItems" :key="it._key" class="mb-2">
                              <div class="flex items-center gap-2">
                                <input
                                    v-model="it.name"
                                    class="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    :placeholder="`Item ${itemIndex + 1}`"
                                />

                                <!-- ✅ IMPORTANT: teacher selects correct option for each item -->
                                <select
                                    v-model="it.matchedOption"
                                    class="px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option :value="null">Select option</option>
                                  <option
                                      v-for="(op, opIndex) in question.matchingOptions"
                                      :key="op._key"
                                      :value="op.id"
                                  >
                                    {{ opIndex + 1 }}. {{ op.text || "—" }}
                                  </option>
                                </select>

                                <button
                                    type="button"
                                    class="px-3 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200"
                                    @click="removeMatchingItem(partIndex, sectionIndex, qIndex, itemIndex)"
                                >
                                  &times;
                                </button>
                              </div>
                            </div>
                          </div>

                          <!-- Options -->
                          <div class="bg-white rounded-2xl border p-3">
                            <div class="flex items-center justify-between mb-2">
                              <label class="text-sm font-medium text-gray-700">Options</label>
                              <button type="button" class="text-sm text-blue-600 hover:text-blue-800" @click="addMatchingOption(partIndex, sectionIndex, qIndex)">
                                + Add Option
                              </button>
                            </div>

                            <div v-for="(op, optIndex) in question.matchingOptions" :key="op._key" class="mb-2">
                              <div class="flex items-center gap-2">
                                <div class="w-8 text-xs text-gray-500">{{ optIndex + 1 }}.</div>
                                <input
                                    v-model="op.text"
                                    class="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    :placeholder="`Option ${optIndex + 1}`"
                                />
                                <button
                                    v-if="question.matchingOptions.length > 2"
                                    type="button"
                                    class="px-3 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200"
                                    @click="removeMatchingOption(partIndex, sectionIndex, qIndex, optIndex)"
                                >
                                  &times;
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p class="text-xs text-gray-500">
                          Tip: For each Item choose the correct Option. Otherwise <b>correct_option_id</b> will be NULL.
                        </p>
                      </div>

                      <!-- Sentence completion -->
                      <div v-if="section.questionType === 'sentence_completion'" class="mt-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                        <input
                            v-model="question.answer"
                            class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter missing words"
                        />
                      </div>

                      <!-- Short answer -->
                      <div v-if="section.questionType === 'short_answer'" class="mt-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                        <input
                            v-model="question.answer"
                            class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter short answer"
                        />
                      </div>
                    </div>

                    <!-- Add question -->
                    <button
                        type="button"
                        class="w-full py-2 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:text-gray-800 hover:border-gray-400 transition"
                        @click="addQuestion(partIndex, sectionIndex)"
                    >
                      + Add Question
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t bg-white flex items-center justify-between">
          <button
              class="bg-black text-white rounded-xl px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="loadingFull || loading"
              @click="save"
          >
            <span v-if="loading">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
          <button class="border rounded-xl px-4 py-2" :disabled="loadingFull || loading" @click="close">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from "vue";
import { testService } from "@/service/testService.js";
const loadingFull = ref(true);

const props = defineProps({
  test: { type: Object, required: true },
  type: { type: String, required: true }, // 'listening' | 'reading' | 'writing'
});

const emit = defineEmits(["close", "save"]);

const error = ref("");
const loading = ref(false);
const audioFile = ref(null);

const questionTypes = [
  { id: "note_completion", name: "Note Completion" },
  { id: "multiple_choice", name: "Multiple Choice" },
  { id: "matching", name: "Matching" },
  { id: "sentence_completion", name: "Sentence Completion" },
  { id: "short_answer", name: "Short Answer" },
  { id: "diagram_labeling", name: "Diagram Labeling" },
];

const uid = () => Math.random().toString(36).slice(2);

function ensureShape(test) {
  const t = test || {};
  const type = props.type || t.type || "reading";

  return {
    id: t.id,
    type,
    title: t.title || "",
    duration: Number(t.duration ?? 60),
    description: t.description || "",
    audio_url: t.audio_url || null,

    parts: Array.isArray(t.parts) && t.parts.length
        ? t.parts.map((p) => ({
          _key: uid(),
          description: p.description || "",
          sections: Array.isArray(p.sections) && p.sections.length
              ? p.sections.map((s) => ({
                _key: uid(),
                title: s.title || "",
                content: s.content || "",
                imageUrl: s.image_url || s.imageUrl || null,
                imageFile: null,
                imagePreview: s.image_url || s.imageUrl || null,
                questionType: s.questionType || s.question_type || "note_completion",
                questions: Array.isArray(s.questions) && s.questions.length
                    ? s.questions.map((q) => ({
                      _key: uid(),
                      text: q.text || "",
                      answer: q.answer ?? "",
                      answers: Array.isArray(q.answers) ? q.answers : [],
                      options: Array.isArray(q.options)
                          ? q.options.map((o) => ({
                            _key: uid(),
                            id: o.id ?? uid(),
                            text: o.text ?? "",
                          }))
                          : [],
                      correctOption: q.correctOption ?? null,
                      matchingItems: Array.isArray(q.matchingItems)
                          ? q.matchingItems.map((it) => ({
                            _key: uid(),
                            name: it.name ?? "",
                            matchedOption: it.matchedOption ?? null,
                          }))
                          : [],
                      matchingOptions: Array.isArray(q.matchingOptions)
                          ? q.matchingOptions.map((op) => ({
                            _key: uid(),
                            id: op.id ?? uid(),
                            text: op.text ?? "",
                          }))
                          : [],
                    }))
                    : [
                      {
                        _key: uid(),
                        text: "",
                        answer: "",
                        answers: [],
                        options: [],
                        correctOption: null,
                        matchingItems: [],
                        matchingOptions: [],
                      },
                    ],
              }))
              : [
                {
                  _key: uid(),
                  title: "",
                  content: "",
                  imageUrl: null,
                  imageFile: null,
                  imagePreview: null,
                  questionType: "note_completion",
                  questions: [
                    {
                      _key: uid(),
                      text: "",
                      answer: "",
                      answers: [],
                      options: [],
                      correctOption: null,
                      matchingItems: [],
                      matchingOptions: [],
                    },
                  ],
                },
              ],
        }))
        : [
          {
            _key: uid(),
            description: "",
            sections: [
              {
                _key: uid(),
                title: "",
                content: "",
                imageUrl: null,
                imageFile: null,
                imagePreview: null,
                questionType: "note_completion",
                questions: [
                  {
                    _key: uid(),
                    text: "",
                    answer: "",
                    answers: [""],
                    options: [],
                    correctOption: null,
                    matchingItems: [],
                    matchingOptions: [],
                  },
                ],
              },
            ],
          },
        ],
  };
}

const local = reactive(ensureShape({ ...props.test, type: props.type }));

watch(
    () => props.test,
    (v) => {
      Object.assign(local, ensureShape({ ...v, type: props.type }));
      audioFile.value = null;
      error.value = "";
    },
    { deep: true, immediate: true }
);

const close = () => emit("close");

const handleAudioUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  audioFile.value = file;
};

const handleSectionImageUpload = (event, partIndex, sectionIndex) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const section = local.parts[partIndex].sections[sectionIndex];

  if (section.imagePreview && section.imagePreview.startsWith("blob:")) {
    URL.revokeObjectURL(section.imagePreview);
  }

  section.imageFile = file;
  section.imagePreview = URL.createObjectURL(file);
};

const removeSectionImage = (partIndex, sectionIndex) => {
  const section = local.parts[partIndex].sections[sectionIndex];
  if (section.imagePreview && section.imagePreview.startsWith("blob:")) {
    URL.revokeObjectURL(section.imagePreview);
  }
  section.imageFile = null;
  section.imagePreview = null;
  section.imageUrl = null;
};

const addPart = () => {
  local.parts.push({
    _key: uid(),
    description: "",
    sections: [
      {
        _key: uid(),
        title: "",
        content: "",
        imageUrl: null,
        imageFile: null,
        imagePreview: null,
        questionType: "note_completion",
        questions: [
          {
            _key: uid(),
            text: "",
            answer: "",
            answers: [""],
            options: [],
            correctOption: null,
            matchingItems: [],
            matchingOptions: [],
          },
        ],
      },
    ],
  });
};

const removePart = (partIndex) => {
  local.parts.splice(partIndex, 1);
};

const addSection = (partIndex) => {
  local.parts[partIndex].sections.push({
    _key: uid(),
    title: "",
    content: "",
    imageUrl: null,
    imageFile: null,
    imagePreview: null,
    questionType: "note_completion",
    questions: [
      {
        _key: uid(),
        text: "",
        answer: "",
        answers: [""],
        options: [],
        correctOption: null,
        matchingItems: [],
        matchingOptions: [],
      },
    ],
  });
};

const removeSection = (partIndex, sectionIndex) => {
  local.parts[partIndex].sections.splice(sectionIndex, 1);
};

const setSectionQuestionType = (partIndex, sectionIndex, type) => {
  const section = local.parts[partIndex].sections[sectionIndex];
  section.questionType = type;

  section.questions.forEach((q) => {
    if (type === "note_completion") {
      if (!Array.isArray(q.answers) || q.answers.length < 1) q.answers = [""];
    }
    if (type === "multiple_choice") {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        q.options = [
          { _key: uid(), id: uid(), text: "" },
          { _key: uid(), id: uid(), text: "" },
        ];
      }
      if (!q.correctOption) q.correctOption = q.options[0]?.id ?? null;
    }
    if (type === "matching") {
      if (!Array.isArray(q.matchingOptions) || q.matchingOptions.length < 2) {
        q.matchingOptions = [
          { _key: uid(), id: uid(), text: "" },
          { _key: uid(), id: uid(), text: "" },
        ];
      }
      if (!Array.isArray(q.matchingItems) || q.matchingItems.length < 1) {
        q.matchingItems = [{ _key: uid(), name: "", matchedOption: null }];
      }
    }
  });
};

const addQuestion = (partIndex, sectionIndex) => {
  const section = local.parts[partIndex].sections[sectionIndex];
  const qt = section.questionType;

  const q = {
    _key: uid(),
    text: "",
    answer: "",
    answers: [],
    options: [],
    correctOption: null,
    matchingItems: [],
    matchingOptions: [],
  };

  if (qt === "note_completion") q.answers = [""];
  if (qt === "multiple_choice") {
    q.options = [
      { _key: uid(), id: uid(), text: "" },
      { _key: uid(), id: uid(), text: "" },
    ];
    q.correctOption = q.options[0].id;
  }
  if (qt === "matching") {
    q.matchingOptions = [
      { _key: uid(), id: uid(), text: "" },
      { _key: uid(), id: uid(), text: "" },
    ];
    q.matchingItems = [{ _key: uid(), name: "", matchedOption: null }];
  }

  section.questions.push(q);
};

const removeQuestion = (partIndex, sectionIndex, qIndex) => {
  local.parts[partIndex].sections[sectionIndex].questions.splice(qIndex, 1);
};

const addBlank = (question) => {
  if (!Array.isArray(question.answers)) question.answers = [];
  question.answers.push("");
};
const removeBlank = (question, index) => {
  question.answers.splice(index, 1);
};

const addOption = (partIndex, sectionIndex, qIndex) => {
  const q = local.parts[partIndex].sections[sectionIndex].questions[qIndex];
  if (!Array.isArray(q.options)) q.options = [];
  q.options.push({ _key: uid(), id: uid(), text: "" });
  if (!q.correctOption && q.options[0]) q.correctOption = q.options[0].id;
};

const removeOption = (partIndex, sectionIndex, qIndex, optIndex) => {
  const q = local.parts[partIndex].sections[sectionIndex].questions[qIndex];
  const removed = q.options.splice(optIndex, 1)[0];
  if (removed && q.correctOption === removed.id) q.correctOption = q.options[0]?.id ?? null;
};

const addMatchingItem = (partIndex, sectionIndex, qIndex) => {
  const q = local.parts[partIndex].sections[sectionIndex].questions[qIndex];
  if (!Array.isArray(q.matchingItems)) q.matchingItems = [];
  q.matchingItems.push({ _key: uid(), name: "", matchedOption: null });
};
const removeMatchingItem = (partIndex, sectionIndex, qIndex, itemIndex) => {
  const q = local.parts[partIndex].sections[sectionIndex].questions[qIndex];
  q.matchingItems.splice(itemIndex, 1);
};

const addMatchingOption = (partIndex, sectionIndex, qIndex) => {
  const q = local.parts[partIndex].sections[sectionIndex].questions[qIndex];
  if (!Array.isArray(q.matchingOptions)) q.matchingOptions = [];
  q.matchingOptions.push({ _key: uid(), id: uid(), text: "" });
};

const removeMatchingOption = (partIndex, sectionIndex, qIndex, optIndex) => {
  const q = local.parts[partIndex].sections[sectionIndex].questions[qIndex];
  const removed = q.matchingOptions.splice(optIndex, 1)[0];
  if (removed?.id) {
    q.matchingItems?.forEach((it) => {
      if (it.matchedOption === removed.id) it.matchedOption = null;
    });
  }
};

const getQuestionPlaceholder = (type, index) => {
  switch (type) {
    case "note_completion":
      return "e.g., Holiday begins on...";
    case "multiple_choice":
      return "e.g., The market is now situated...";
    case "matching":
      return "e.g., Match each item with the correct option...";
    case "sentence_completion":
      return "e.g., Complete the sentence...";
    case "short_answer":
      return "e.g., How many people are in the group?";
    case "diagram_labeling":
      return "e.g., Label the diagram...";
    default:
      return `Enter question ${index + 1}`;
  }
};

const save = async () => {
  error.value = "";

  if (!local.title?.trim()) {
    error.value = "Test Title is required";
    return;
  }
  if (!local.duration || Number(local.duration) <= 0) {
    error.value = "Duration must be a positive number";
    return;
  }

  // ✅ payload without audioFile by default
  const payload = {
    id: local.id,
    type: local.type,
    title: local.title,
    duration: Number(local.duration),
    description: local.description,
    parts: local.parts.map((p) => ({
      description: p.description,
      sections: p.sections.map((s) => ({
        title: s.title,
        content: s.content,
        questionType: s.questionType,
        imageFile: s.imageFile,
        imageUrl: s.imageUrl,
        questions: s.questions.map((q) => ({
          id: q.id, // ✅ важно для update
          text: q.text,
          answer: q.answer,
          answers: q.answers,
          options: q.options?.map((o) => ({ id: o.id, text: o.text })) || [],
          correctOption: q.correctOption,
          matchingItems: q.matchingItems?.map((it) => ({
            name: it.name,
            matchedOption: it.matchedOption,
          })) || [],
          matchingOptions: q.matchingOptions?.map((o) => ({
            id: o.id,
            text: o.text,
          })) || [],
        })),
      })),
    })),
  };

  // ✅ ONLY listening can send audioFile
  if (local.type === "listening") {
    payload.audioFile = audioFile.value || null;
  }

  try {
    loading.value = true;
    await emit("save", payload); // родитель делает update в supabase
  } catch (e) {
    error.value = e?.message || "Failed to save";
  } finally {
    loading.value = false;
  }
};

const loadFullTest = async () => {
  loadingFull.value = true;
  error.value = "";
  try {
    // ВАЖНО: тут мы получаем ВСЮ структуру
    const full = await testService.getFullTest(props.type, props.test.id)

    // обновляем local (чтобы появились parts/sections/questions)
    Object.assign(local, ensureShape({ ...full, type: props.type }));
  } catch (e) {
    console.error(e);
    error.value = e.message || "Failed to load test details";
  } finally {
    loadingFull.value = false;
  }
};

onMounted(loadFullTest);
watch(
    () => [props.test?.id, props.type],
    () => loadFullTest(),
    { immediate: true }
);
</script>


