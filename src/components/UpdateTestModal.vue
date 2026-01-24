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

<template>
  <teleport to="body">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />

      <div class="relative w-full max-w-3xl bg-white rounded-2xl p-6">
        <h2 class="text-xl font-semibold mb-2">Edit {{ type }} test</h2>
        <p class="text-sm text-gray-500 mb-4">ID: {{ test.id }}</p>

        <input v-model="local.title" class="w-full border rounded-xl px-3 py-2" />

        <div class="mt-4 flex justify-end gap-2">
          <button class="border rounded-xl px-4 py-2" @click="$emit('close')">Cancel</button>
          <button class="bg-black text-white rounded-xl px-4 py-2" @click="$emit('save', local)">Save</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { reactive, watch } from "vue";
const props = defineProps({ test: Object, type: String });
const local = reactive({ ...props.test });

watch(
    () => props.test,
    (v) => Object.assign(local, v || {}),
    { deep: true, immediate: true }
);
</script>
