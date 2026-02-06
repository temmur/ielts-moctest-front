<template>
  <teleport to="body">
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

            <div class="text-center text-sm text-gray-500 pt-2">
              Loading test data...
            </div>
          </div>

          <!-- ✅ REAL FORM -->
          <div v-else>
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

            <!-- ✅ WRITING UI -->
            <div v-if="type === 'writing'" class="mt-6 space-y-6">
              <!-- Task 1 -->
              <div class="border-2 border-blue-200 rounded-2xl p-5 bg-blue-50">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-semibold">1</div>
                  <div>
                    <div class="font-semibold text-blue-900">Writing Task 1</div>
                    <div class="text-xs text-blue-700/70">Chart / Diagram description</div>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input
                      v-model="local.tasks.task1.title"
                      class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., The chart below shows..."
                  />
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Task Question</label>
                  <textarea
                      v-model="local.tasks.task1.question"
                      rows="4"
                      class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Summarise the information..."
                  />
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Task 1 Image</label>
                  <div class="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-white">
                    <div v-if="task1ImagePreview" class="mb-3">
                      <img :src="task1ImagePreview" class="max-h-56 mx-auto rounded-xl" alt="preview" />
                      <div class="text-xs text-gray-500 mt-2 text-center">
                        {{ task1ImageFile ? "New image selected" : "Current image exists" }}
                      </div>
                    </div>
                    <div v-else class="text-center py-5">
                      <div class="text-4xl text-gray-300 mb-2">📊</div>
                      <div class="text-sm text-gray-500">No image</div>
                    </div>

                    <div class="mt-3 flex items-center justify-center gap-2">
                      <label class="inline-flex items-center px-4 py-2 bg-white border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <input type="file" accept="image/*" class="hidden" @change="handleTask1ImageUpload" />
                        {{ task1ImagePreview ? "Change Image" : "Upload Image" }}
                      </label>

                      <button
                          v-if="task1ImagePreview"
                          class="px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                          @click="removeTask1Image"
                          type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Minimum Words</label>
                    <input
                        v-model.number="local.tasks.task1.minWords"
                        type="number"
                        class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Recommended Time</label>
                    <input
                        v-model.number="local.tasks.task1.recommendedTime"
                        type="number"
                        class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <!-- Task 2 -->
              <div class="border-2 border-green-200 rounded-2xl p-5 bg-green-50">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-9 h-9 bg-green-600 text-white rounded-xl flex items-center justify-center font-semibold">2</div>
                  <div>
                    <div class="font-semibold text-green-900">Writing Task 2</div>
                    <div class="text-xs text-green-700/70">Essay</div>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input
                      v-model="local.tasks.task2.title"
                      class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Some people believe that..."
                  />
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Task Question</label>
                  <textarea
                      v-model="local.tasks.task2.question"
                      rows="4"
                      class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="To what extent do you agree or disagree?"
                  />
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Task 2 Image (optional)</label>
                  <div class="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-white">
                    <div v-if="task2ImagePreview" class="mb-3">
                      <img :src="task2ImagePreview" class="max-h-56 mx-auto rounded-xl" alt="preview" />
                      <div class="text-xs text-gray-500 mt-2 text-center">
                        {{ task2ImageFile ? "New image selected" : "Current image exists" }}
                      </div>
                    </div>
                    <div v-else class="text-center py-5">
                      <div class="text-4xl text-gray-300 mb-2">📝</div>
                      <div class="text-sm text-gray-500">No image</div>
                    </div>

                    <div class="mt-3 flex items-center justify-center gap-2">
                      <label class="inline-flex items-center px-4 py-2 bg-white border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <input type="file" accept="image/*" class="hidden" @change="handleTask2ImageUpload" />
                        {{ task2ImagePreview ? "Change Image" : "Upload Image" }}
                      </label>

                      <button
                          v-if="task2ImagePreview"
                          class="px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                          @click="removeTask2Image"
                          type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Minimum Words</label>
                    <input
                        v-model.number="local.tasks.task2.minWords"
                        type="number"
                        class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Recommended Time</label>
                    <input
                        v-model.number="local.tasks.task2.recommendedTime"
                        type="number"
                        class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Essay Type</label>
                    <select
                        v-model="local.tasks.task2.essayType"
                        class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="opinion">Opinion</option>
                      <option value="discussion">Discussion</option>
                      <option value="solution">Problem-Solution</option>
                      <option value="advantage">Advantage-Disadvantage</option>
                      <option value="two-part">Two-part</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- ✅ LISTENING/READING UI -->
            <div v-else class="mt-6">
              <!-- Part Navigation Header -->
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold">Parts & Sections</h3>
                <div class="flex items-center gap-2">
                  <button
                      class="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      :disabled="local.parts.length >= 4"
                      @click="addPart"
                  >
                    + Add Part
                  </button>
                  <span class="text-gray-400 mx-2">|</span>
                  <span class="text-sm text-gray-600">
                    Part {{ currentPartIndex + 1 }} of {{ local.parts.length }}
                  </span>
                </div>
              </div>

              <!-- Part Navigation Buttons -->
              <div class="flex items-center justify-between mb-4">
                <button
                    :disabled="currentPartIndex === 0"
                    @click="prevPart"
                    class="flex items-center gap-2 px-4 py-2 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Part
                </button>

                <button
                    :disabled="currentPartIndex === local.parts.length - 1"
                    @click="nextPart"
                    class="flex items-center gap-2 px-4 py-2 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next Part
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <!-- Current Part Display -->
              <div
                  v-if="currentPartIndex < local.parts.length"
                  class="border rounded-2xl p-5 bg-white"
              >
                <!-- Get current part data -->
                <template v-if="currentPart">
                  <!-- Part header -->
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-semibold">
                        {{ currentPartIndex + 1 }}
                      </div>
                      <div>
                        <div class="font-semibold text-gray-900">Part {{ currentPartIndex + 1 }}</div>
                        <div class="text-xs text-gray-500">
                          {{ currentPart.sections.length }} section{{ currentPart.sections.length !== 1 ? "s" : "" }}
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <button class="text-sm text-blue-600 hover:text-blue-800" @click="addSection(currentPartIndex)">
                        + Add Section
                      </button>
                      <button
                          v-if="local.parts.length > 1"
                          class="text-sm text-red-600 hover:text-red-800"
                          @click="removePart(currentPartIndex)"
                      >
                        Remove Part
                      </button>
                    </div>
                  </div>

                  <!-- Part description -->
                  <div class="mb-5">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Part Description (Optional)</label>
                    <textarea
                        v-model="currentPart.description"
                        rows="2"
                        class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., You will hear a conversation..."
                    />
                  </div>

                  <!-- Sections -->
                  <div class="space-y-6">
                    <div
                        v-for="(section, sectionIndex) in currentPart.sections"
                        :key="section._key"
                        class="border-l-4 border-blue-400 bg-blue-50/30 rounded-2xl p-4"
                    >
                      <!-- Section header -->
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                          <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs">
                            {{ getGlobalSectionNumber(currentPartIndex, sectionIndex) }}
                          </div>
                          <div class="font-semibold text-gray-900">
                            Section {{ getGlobalSectionNumber(currentPartIndex, sectionIndex) }}
                          </div>
                        </div>

                        <button
                            v-if="currentPart.sections.length > 1"
                            class="text-sm text-red-600 hover:text-red-800"
                            @click="removeSection(currentPartIndex, sectionIndex)"
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

                      <!-- Section Image (listening only if you want) -->
                      <div class="mb-4" v-if="type === 'listening'">
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
                            <label class="inline-flex items-center px-4 py-2 bg-white border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                              <input type="file" accept="image/*" class="hidden" @change="(e) => handleSectionImageUpload(e, currentPartIndex, sectionIndex)" />
                              {{ section.imagePreview ? "Change Image" : "Upload Image" }}
                            </label>
                            <button
                                v-if="section.imagePreview"
                                class="px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                                @click="removeSectionImage(currentPartIndex, sectionIndex)"
                                type="button"
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
                              @click="setSectionQuestionType(currentPartIndex, sectionIndex, qt.id)"
                          >
                            {{ qt.name }}
                          </button>
                        </div>
                      </div>

                      <!-- ✅ NON-MATCHING QUESTIONS -->
                      <div v-if="section.questionType !== 'matching'" class="space-y-3">
                        <div
                            v-for="(question, qIndex) in section.questions"
                            :key="question._key"
                            class="border border-gray-200 bg-white rounded-2xl p-4"
                        >
                          <div class="flex items-center justify-between mb-2">
                            <div class="font-medium text-gray-800">
                              Question {{ getGlobalQuestionNumber(currentPartIndex, sectionIndex, qIndex) }}
                            </div>
                            <button
                                v-if="section.questions.length > 1"
                                class="text-sm text-red-600 hover:text-red-800"
                                @click="removeQuestion(currentPartIndex, sectionIndex, qIndex)"
                                type="button"
                            >
                              Remove
                            </button>
                          </div>

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

                          <!-- Note Completion -->
                          <div v-if="section.questionType === 'note_completion'" class="mb-2">
                            <div class="flex items-center justify-between">
                              <label class="block text-sm font-medium text-gray-700">Correct Answers (for {{1}}, {{2}} ...)</label>
                              <button class="text-sm text-blue-600 hover:text-blue-800" type="button" @click="addBlank(question)">
                                + Add Answer
                              </button>
                            </div>

                            <div class="mt-2 space-y-2">
                              <div v-for="(ans, ansIndex) in question.answers" :key="ansIndex" class="flex items-center gap-2">
                                <div class="w-20 text-xs text-gray-500">&#123;&#123;{{ ansIndex + 1 }}&#125;&#125;</div>
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

                            <div v-for="(opt, optIndex) in question.options" :key="opt._key" class="flex items-center gap-3">
                              <div class="flex items-center">
                                <input type="radio" v-model="question.correctOption" :value="opt.id" class="h-4 w-4 text-blue-600 focus:ring-blue-500" />
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
                                  @click="removeOption(currentPartIndex, sectionIndex, qIndex, optIndex)"
                              >
                                &times;
                              </button>
                            </div>

                            <button type="button" class="text-sm text-blue-600 hover:text-blue-800" @click="addOption(currentPartIndex, sectionIndex, qIndex)">
                              + Add Option
                            </button>
                          </div>

                          <!-- Sentence completion -->
                          <div v-if="section.questionType === 'sentence_completion'" class="mt-3">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                            <input v-model="question.answer" class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>

                          <!-- Short answer -->
                          <div v-if="section.questionType === 'short_answer'" class="mt-3">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                            <input v-model="question.answer" class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        </div>

                        <button
                            type="button"
                            class="w-full py-2 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:text-gray-800 hover:border-gray-400 transition"
                            @click="addQuestion(currentPartIndex, sectionIndex)"
                        >
                          + Add Question
                        </button>
                      </div>

                      <!-- ✅ MATCHING (SECTION LEVEL) -->
                      <div v-else class="space-y-6">
                        <div class="flex items-center justify-between">
                          <label class="block text-sm font-medium text-gray-700">
                            Matching (one set of options for the whole section)
                          </label>
                          <span class="text-xs text-gray-500">Each question is an item</span>
                        </div>

                        <!-- Options -->
                        <div class="border rounded-2xl p-4 bg-white">
                          <div class="flex items-center justify-between mb-3">
                            <div class="font-semibold text-gray-800">Options (A, B, C ...)</div>
                            <button
                                type="button"
                                @click="addMatchingOption(currentPartIndex, sectionIndex)"
                                class="text-sm text-blue-600 hover:text-blue-800"
                            >
                              + Add Option
                            </button>
                          </div>

                          <div v-if="!(section.matchingOptions?.length)" class="text-sm text-gray-500">
                            Add at least 2 options.
                          </div>

                          <div v-for="(op, optIndex) in (section.matchingOptions || [])" :key="op._key" class="flex items-center gap-2 mb-2">
                            <span class="w-8 text-sm font-bold text-gray-700">
                              {{ String.fromCharCode(65 + optIndex) }}.
                            </span>

                            <input
                                v-model="op.text"
                                type="text"
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                :placeholder="`Option ${String.fromCharCode(65 + optIndex)}`"
                            />

                            <button
                                v-if="(section.matchingOptions || []).length > 2"
                                type="button"
                                @click="removeMatchingOption(currentPartIndex, sectionIndex, optIndex)"
                                class="text-red-500 hover:text-red-700 text-lg"
                            >
                              &times;
                            </button>
                          </div>
                        </div>

                        <!-- Items (Questions) -->
                        <div class="border rounded-2xl p-4 bg-gray-50">
                          <div class="flex items-center justify-between mb-3">
                            <div class="font-semibold text-gray-800">Items</div>
                            <span class="text-xs text-gray-500">Select correct letter for each question</span>
                          </div>

                          <div class="space-y-3">
                            <div
                                v-for="(question, qIndex) in section.questions"
                                :key="question._key"
                                class="border border-gray-200 rounded-2xl p-4 bg-white"
                            >
                              <div class="flex justify-between items-center mb-2">
                                <span class="font-medium text-gray-700">
                                  Question {{ getGlobalQuestionNumber(currentPartIndex, sectionIndex, qIndex) }}
                                </span>
                                <button
                                    v-if="section.questions.length > 1"
                                    @click="removeQuestion(currentPartIndex, sectionIndex, qIndex)"
                                    class="text-red-500 hover:text-red-700 text-sm"
                                    type="button"
                                >
                                  Remove
                                </button>
                              </div>

                              <input
                                  v-model="question.text"
                                  type="text"
                                  class="w-full mb-3 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                  placeholder="e.g., Merrivales / The Lobster Pot / Elliots..."
                              />

                              <select v-model="question.matchedOption" class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
                                <option disabled value="">Select correct option letter</option>
                                <option
                                    v-for="(op, optIndex) in (section.matchingOptions || [])"
                                    :key="op._key"
                                    :value="String.fromCharCode(65 + optIndex)"
                                >
                                  {{ String.fromCharCode(65 + optIndex) }}. {{ op.text }}
                                </option>
                              </select>
                            </div>
                          </div>

                          <button
                              type="button"
                              @click="addQuestion(currentPartIndex, sectionIndex)"
                              class="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors"
                          >
                            + Add Question
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </template>
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
import { reactive, ref, watch, onMounted, computed } from "vue";
import { testService } from "@/service/testService.ts";

const loadingFull = ref(true);

const props = defineProps({
  test: { type: Object, required: true },
  type: { type: String, required: true }, // 'listening' | 'reading' | 'writing'
});

const emit = defineEmits(["close", "save"]);

const error = ref("");
const loading = ref(false);
const audioFile = ref(null);
const currentPartIndex = ref(0);

const task1ImageFile = ref(null);
const task1ImagePreview = ref(null);
const task2ImageFile = ref(null);
const task2ImagePreview = ref(null);

const questionTypes = [
  { id: "note_completion", name: "Note Completion" },
  { id: "multiple_choice", name: "Multiple Choice" },
  { id: "matching", name: "Matching" },
  { id: "sentence_completion", name: "Sentence Completion" },
  { id: "short_answer", name: "Short Answer" },
  { id: "diagram_labeling", name: "Diagram Labeling" },
];

// Add computed property for current part
const currentPart = computed(() => {
  if (currentPartIndex.value < 0 || currentPartIndex.value >= local.parts.length) {
    return null;
  }
  return local.parts[currentPartIndex.value];
});

const uid = () => Math.random().toString(36).slice(2);

/**
 * ✅ Приводим "matching из базы" к section-level формату:
 * - section.matchingOptions: [{_key,text}]
 * - question.matchedOption: 'A'|'B'...
 */
function normalizeSectionMatching(section) {
  if (section.questionType !== "matching") return section;

  // найти anchor question, где есть matchingOptions/matchingItems
  const anchor = (section.questions || []).find(
      (q) => Array.isArray(q.matchingOptions) && q.matchingOptions.length
  ) || (section.questions || [])[0];

  const dbOptions = (anchor?.matchingOptions || []).slice();
  // dbOptions: [{id,text}] уже отсортированы сервисом по label
  const idToLetter = new Map();
  dbOptions.forEach((o, i) => {
    idToLetter.set(o.id, String.fromCharCode(65 + i));
  });

  // items mapping: item_text -> correct_option_id
  const itemMap = new Map();
  (anchor?.matchingItems || []).forEach((it) => {
    if (it?.name) itemMap.set(it.name, it.matchedOption ?? null);
  });

  // section-level options
  section.matchingOptions = dbOptions.map((o) => ({
    _key: uid(),
    text: o.text ?? "",
  }));

  // set each question.matchedOption as LETTER
  section.questions = (section.questions || []).map((q) => {
    const correctId = itemMap.get(q.text) ?? null; // сопоставляем по тексту
    return {
      ...q,
      matchedOption: correctId ? (idToLetter.get(correctId) || "") : (q.matchedOption || ""),
    };
  });

  return section;
}

function ensureShape(test) {
  const t = test || {};
  const type = props.type || t.type || "reading";

  if (type === "writing") {
    const tasks = t.tasks || {};
    const task1 = tasks.task1 || {};
    const task2 = tasks.task2 || {};
    return {
      id: t.id,
      type,
      title: t.title || "",
      duration: Number(t.duration ?? 60),
      description: t.description || "",
      audio_url: null,
      parts: [],
      tasks: {
        task1: {
          title: task1.title || "",
          question: task1.question || "",
          minWords: Number(task1.minWords ?? 150),
          recommendedTime: Number(task1.recommendedTime ?? 20),
          imageUrl: task1.imageUrl ?? null,
        },
        task2: {
          title: task2.title || "",
          question: task2.question || "",
          minWords: Number(task2.minWords ?? 250),
          recommendedTime: Number(task2.recommendedTime ?? 40),
          essayType: task2.essayType ?? "opinion",
          imageUrl: task2.imageUrl ?? null,
        },
      },
    };
  }

  return {
    id: t.id,
    type,
    title: t.title || "",
    duration: Number(t.duration ?? 60),
    description: t.description || "",
    audio_url: t.audio_url || null,
    tasks: null,

    parts: Array.isArray(t.parts) && t.parts.length
        ? t.parts.map((p) => ({
          _key: uid(),
          description: p.description || "",
          sections: (Array.isArray(p.sections) ? p.sections : []).map((s) => {
            const sec = {
              _key: uid(),
              title: s.title || "",
              content: s.content || "",
              imageUrl: s.image_url || s.imageUrl || null,
              imageFile: null,
              imagePreview: s.image_url || s.imageUrl || null,
              questionType: s.questionType || s.question_type || "note_completion",
              matchingOptions: Array.isArray(s.matchingOptions) ? s.matchingOptions : [],
              questions: Array.isArray(s.questions) && s.questions.length
                  ? s.questions.map((q) => ({
                    _key: uid(),
                    text: q.text || "",
                    answer: q.answer ?? "",
                    answers: Array.isArray(q.answers) ? q.answers : [],
                    options: Array.isArray(q.options)
                        ? q.options.map((o) => ({ _key: uid(), id: o.id ?? uid(), text: o.text ?? "" }))
                        : [],
                    correctOption: q.correctOption ?? null,

                    // из базы может прийти
                    matchingItems: Array.isArray(q.matchingItems)
                        ? q.matchingItems.map((it) => ({ _key: uid(), name: it.name ?? "", matchedOption: it.matchedOption ?? null }))
                        : [],
                    matchingOptions: Array.isArray(q.matchingOptions)
                        ? q.matchingOptions.map((op) => ({ _key: uid(), id: op.id ?? uid(), text: op.text ?? "" }))
                        : [],

                    // section-level поле (после normalize будет буква)
                    matchedOption: q.matchedOption || "",
                  }))
                  : [
                    {
                      _key: uid(),
                      text: "",
                      answer: "",
                      answers: [""],
                      options: [],
                      correctOption: null,
                      matchingItems: [],
                      matchingOptions: [],
                      matchedOption: "",
                    },
                  ],
            };

            return normalizeSectionMatching(sec);
          }),
        }))
        : [
          {
            _key: uid(),
            description: "",
            sections: [
              normalizeSectionMatching({
                _key: uid(),
                title: "",
                content: "",
                imageUrl: null,
                imageFile: null,
                imagePreview: null,
                questionType: "note_completion",
                matchingOptions: [],
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
                    matchedOption: "",
                  },
                ],
              }),
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
      currentPartIndex.value = 0; // Reset to first part when test changes
    },
    { deep: true, immediate: true }
);

const close = () => emit("close");

const handleAudioUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  audioFile.value = file;
};

// writing images
const handleTask1ImageUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  task1ImageFile.value = file;
  if (task1ImagePreview.value?.startsWith("blob:")) URL.revokeObjectURL(task1ImagePreview.value);
  task1ImagePreview.value = URL.createObjectURL(file);
};
const removeTask1Image = () => {
  if (task1ImagePreview.value?.startsWith("blob:")) URL.revokeObjectURL(task1ImagePreview.value);
  task1ImagePreview.value = null;
  task1ImageFile.value = null;
  local.tasks.task1.imageUrl = null;
};

const handleTask2ImageUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  task2ImageFile.value = file;
  if (task2ImagePreview.value?.startsWith("blob:")) URL.revokeObjectURL(task2ImagePreview.value);
  task2ImagePreview.value = URL.createObjectURL(file);
};
const removeTask2Image = () => {
  if (task2ImagePreview.value?.startsWith("blob:")) URL.revokeObjectURL(task2ImagePreview.value);
  task2ImagePreview.value = null;
  task2ImageFile.value = null;
  local.tasks.task2.imageUrl = null;
};

// section image
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

const createEmptyQuestion = () => ({
  _key: uid(),
  text: "",
  answer: "",
  answers: [],
  options: [],
  correctOption: null,
  matchedOption: "", // for matching
});

const createEmptySection = () => ({
  _key: uid(),
  title: "",
  content: "",
  imageUrl: null,
  imageFile: null,
  imagePreview: null,
  questionType: "note_completion",
  questions: [{ ...createEmptyQuestion(), answers: [""] }],
  matchingOptions: [],
});

const maxPartsByType = () => {
  if (local.type === "writing") return 2;
  return 4;
};

const addPart = () => {
  const max = maxPartsByType();
  if (local.parts.length >= max) {
    error.value = `You can create only ${max} parts for ${local.type}.`;
    return;
  }

  local.parts.push({
    _key: uid(),
    description: "",
    sections: [createEmptySection()],
  });

  currentPartIndex.value = local.parts.length - 1;
};

// const addPart = () => {
//   local.parts.push({
//     _key: uid(),
//     description: "",
//     sections: [createEmptySection()],
//   });
//   // Auto-switch to the newly added part
//   currentPartIndex.value = local.parts.length - 1;
// };

const removePart = (partIndex) => {
  local.parts.splice(partIndex, 1);
  // Adjust current part index if we removed the current part
  if (currentPartIndex.value >= local.parts.length) {
    currentPartIndex.value = Math.max(0, local.parts.length - 1);
  }
};

const addSection = (partIndex) => {
  if (partIndex >= 0 && partIndex < local.parts.length) {
    local.parts[partIndex].sections.push(createEmptySection());
  }
};

const removeSection = (partIndex, sectionIndex) => {
  if (partIndex >= 0 && partIndex < local.parts.length) {
    const part = local.parts[partIndex];
    if (sectionIndex >= 0 && sectionIndex < part.sections.length) {
      part.sections.splice(sectionIndex, 1);
    }
  }
};

const setSectionQuestionType = (partIndex, sectionIndex, type) => {
  const section = local.parts[partIndex].sections[sectionIndex];
  section.questionType = type;

  // normalize for each existing question
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
      // section-level options
      if (!Array.isArray(section.matchingOptions) || section.matchingOptions.length < 2) {
        section.matchingOptions = [
          { _key: uid(), text: "" },
          { _key: uid(), text: "" },
        ];
      }
      if (!q.matchedOption) q.matchedOption = "";
    }
  });
};

const addQuestion = (partIndex, sectionIndex) => {
  const section = local.parts[partIndex].sections[sectionIndex];
  const qt = section.questionType;

  const q = createEmptyQuestion();

  if (qt === "note_completion") q.answers = [""];
  if (qt === "multiple_choice") {
    q.options = [
      { _key: uid(), id: uid(), text: "" },
      { _key: uid(), id: uid(), text: "" },
    ];
    q.correctOption = q.options[0].id;
  }

  if (qt === "matching") {
    if (!Array.isArray(section.matchingOptions) || section.matchingOptions.length < 2) {
      section.matchingOptions = [
        { _key: uid(), text: "" },
        { _key: uid(), text: "" },
      ];
    }
    q.matchedOption = "";
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

// section-level matching options
const addMatchingOption = (partIndex, sectionIndex) => {
  const section = local.parts[partIndex].sections[sectionIndex];
  if (!Array.isArray(section.matchingOptions)) section.matchingOptions = [];
  section.matchingOptions.push({ _key: uid(), text: "" });
};

const removeMatchingOption = (partIndex, sectionIndex, optIndex) => {
  const section = local.parts[partIndex].sections[sectionIndex];
  section.matchingOptions.splice(optIndex, 1);

  // если учитель удалил option — сбрасываем matchedOption у вопросов, если буква выходит за пределы
  const maxLetter = String.fromCharCode(65 + (section.matchingOptions.length - 1));
  section.questions.forEach((q) => {
    if (!q.matchedOption) return;
    if (q.matchedOption > maxLetter) q.matchedOption = "";
  });
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

/** ✅ global numbering */
const getGlobalSectionNumber = (partIndex, sectionIndex) => {
  let count = 0;
  for (let p = 0; p < local.parts.length; p++) {
    const secLen = local.parts[p].sections.length;
    if (p < partIndex) count += secLen;
  }
  return count + sectionIndex + 1;
};

const getGlobalQuestionNumber = (partIndex, sectionIndex, qIndex) => {
  let count = 0;
  for (let p = 0; p < local.parts.length; p++) {
    for (let s = 0; s < local.parts[p].sections.length; s++) {
      const qLen = local.parts[p].sections[s].questions.length;
      if (p < partIndex) count += qLen;
      else if (p === partIndex && s < sectionIndex) count += qLen;
    }
  }
  return count + qIndex + 1;
};

// Add these functions for part navigation
const prevPart = () => {
  if (currentPartIndex.value > 0) {
    currentPartIndex.value--;
  }
};

const nextPart = () => {
  if (currentPartIndex.value < local.parts.length - 1) {
    currentPartIndex.value++;
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

  // ✅ writing payload
  if (local.type === "writing") {
    const payload = {
      id: local.id,
      type: local.type,
      title: local.title,
      duration: Number(local.duration),
      description: local.description,
      tasks: {
        task1: {
          ...local.tasks.task1,
          imageFile: task1ImageFile.value || null,
        },
        task2: {
          ...local.tasks.task2,
          imageFile: task2ImageFile.value || null,
        },
      },
    };

    try {
      loading.value = true;
      await emit("save", payload);
    } catch (e) {
      error.value = e?.message || "Failed to save";
    } finally {
      loading.value = false;
    }
    return;
  }

  // ✅ listening/reading payload (with section-level matching)
  const payload = {
    id: local.id,
    type: local.type,
    title: local.title,
    duration: Number(local.duration),
    description: local.description,
    parts: local.parts.map((p, index) => ({
      description: p.description,
      sections: p.sections.map((s) => ({
        title: s.title,
        content: s.content,
        questionType: s.questionType,
        imageFile: s.imageFile,
        imageUrl: s.imageUrl,

        // ✅ IMPORTANT: section-level matchingOptions
        matchingOptions: s.questionType === "matching"
            ? (s.matchingOptions || []).map((o) => ({ text: o.text }))
            : [],

        questions: (s.questions || []).map((q) => ({
          id: q.id,
          text: q.text,
          answer: q.answer,
          answers: q.answers,
          options: q.options?.map((o) => ({ id: o.id, text: o.text })) || [],
          correctOption: q.correctOption,

          // ✅ IMPORTANT: for matching — store letter
          matchedOption: s.questionType === "matching" ? (q.matchedOption || "") : undefined,
        })),
      })),
    })),
  };

  if (local.type === "listening") payload.audioFile = audioFile.value || null;

  try {
    loading.value = true;
    await emit("save", payload);
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
    const full = await testService.getFullTest(props.type, props.test.id);
    Object.assign(local, ensureShape({ ...full, type: props.type }));

    // init writing previews from DB
    if (props.type === "writing") {
      task1ImagePreview.value = local.tasks?.task1?.imageUrl || null;
      task2ImagePreview.value = local.tasks?.task2?.imageUrl || null;
      task1ImageFile.value = null;
      task2ImageFile.value = null;
    }

    // Reset to first part when loading
    currentPartIndex.value = 0;
  } catch (e) {
    console.error(e);
    error.value = e.message || "Failed to load test details";
  } finally {
    loadingFull.value = false;
  }
};

onMounted(loadFullTest);
watch(() => [props.test?.id, props.type], () => loadFullTest(), { immediate: true });
</script>
