<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div
        class="relative top-10 mx-auto p-5 border w-4/5 max-w-6xl shadow-lg rounded-md bg-white h-[90vh] overflow-y-scroll"
    >
      <!-- Modal Header -->
      <div class="flex justify-between items-center pb-3 border-b">
        <h3 class="text-2xl font-bold text-gray-800">Create New Test</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">
          &times;
        </button>
      </div>

      <!-- Modal Body -->
      <div class="mt-6">
        <!-- Step 1: Test Type Selection -->
        <div v-if="step === 1" class="mb-8">
          <h4 class="text-lg font-semibold mb-4 text-gray-700">Choose Test Type</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
                v-for="type in testTypes"
                :key="type.id"
                @click="selectTestType(type.id)"
                class="p-6 border-2 rounded-lg text-center transition-all hover:bg-blue-50 hover:border-blue-400"
                :class="{
                'border-blue-500 bg-blue-50': selectedTestType === type.id,
                'border-gray-300': selectedTestType !== type.id
              }"
            >
              <div class="text-3xl mb-2">{{ type.icon }}</div>
              <div class="font-semibold text-gray-800">{{ type.name }}</div>
              <div class="text-sm text-gray-500 mt-2">{{ type.description }}</div>
            </button>
          </div>
        </div>

        <!-- Step 2: Test Creation Form -->
        <div v-if="step === 2">
          <!-- Test Type Header -->
          <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-semibold text-blue-800">Creating:</span>
                <span class="ml-2 text-lg font-bold text-blue-900">
                  {{ testTypes.find(t => t.id === selectedTestType)?.name }} Test
                </span>
                <span v-if="currentUser?.profile?.full_name" class="ml-2 text-sm text-blue-600">
                  (Teacher: {{ currentUser.profile.full_name }})
                </span>
              </div>
              <button @click="step = 1" class="text-sm text-blue-600 hover:text-blue-800">
                Change Type
              </button>
            </div>
          </div>

          <!-- Authentication Check -->
          <div v-if="!currentUser" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
              <div class="text-red-600 mr-3">🔒</div>
              <div>
                <p class="text-red-700 font-medium">Authentication Required</p>
                <p class="text-red-600 text-sm">You must be logged in to create tests.</p>
              </div>
            </div>
          </div>

          <div
              v-else-if="currentUser?.profile?.role !== 'teacher'"
              class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div class="flex items-center">
              <div class="text-red-600 mr-3">👨‍🏫</div>
              <div>
                <p class="text-red-700 font-medium">Teacher Access Required</p>
                <p class="text-red-600 text-sm">Only teachers can create tests. Your role: {{ currentUser.profile.role }}</p>
              </div>
            </div>
          </div>

          <!-- Listening/Reading Test Creation -->
          <div v-else-if="selectedTestType === 'listening' || selectedTestType === 'reading'">
            <div class="space-y-8">
              <!-- ✅ REPLACE your whole block with this (Part navigation + single active part) -->

              <!-- PART NAV (top of parts area) -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <button
                      type="button"
                      @click="prevPart"
                      :disabled="activePartIndex === 0"
                      class="px-3 py-2 border rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Prev Part
                  </button>

                  <div class="text-sm text-gray-600">
                    Part <b>{{ activePartIndex + 1 }}</b> / {{ testParts.length }}
                  </div>

                  <button
                      type="button"
                      @click="nextPart"
                      :disabled="activePartIndex === testParts.length - 1"
                      class="px-3 py-2 border rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Part →
                  </button>
                </div>

                <button
                    type="button"
                    @click="addPart"
                    :disabled="testParts.length >= 4"
                    class="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add Part
                </button>
              </div>

              <!-- ACTIVE PART ONLY -->
              <div class="border rounded-lg p-5 bg-gray-50">
                <!-- Part Header -->
                <div class="flex justify-between items-center mb-4">
                  <div class="flex items-center">
                    <h4 class="text-lg font-semibold text-gray-800 mr-3">Part {{ activePartIndex + 1 }}</h4>
                    <span class="text-sm text-gray-500">
        ({{ testParts[activePartIndex].sections.length }}
        section{{ testParts[activePartIndex].sections.length !== 1 ? 's' : '' }})
      </span>
                  </div>

                  <div class="flex gap-2">
                    <button
                        @click="addSection(activePartIndex)"
                        class="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Section
                    </button>

                    <button
                        v-if="testParts.length > 1"
                        @click="removePart(activePartIndex)"
                        class="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove Part
                    </button>
                  </div>
                </div>

                <!-- Part Description -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Part Description (Optional)</label>
                  <textarea
                      v-model="testParts[activePartIndex].description"
                      rows="2"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., You will hear a conversation between a travel agent and a customer..."
                  ></textarea>
                </div>

                <!-- Sections within Active Part -->
                <div class="space-y-6">
                  <div
                      v-for="(section, sectionIndex) in testParts[activePartIndex].sections"
                      :key="sectionIndex"
                      class="border-l-4 border-blue-400 pl-4 py-4 bg-white rounded-r"
                  >
                    <!-- Section Header -->
                    <div class="flex justify-between items-center mb-3">
                      <div class="flex items-center">
                        <div class="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs mr-2">
                          {{ getGlobalSectionNumber(activePartIndex, sectionIndex) }}
                        </div>

                        <h5 class="font-medium text-gray-800">
                          Section {{ getGlobalSectionNumber(activePartIndex, sectionIndex) }}
                        </h5>
                      </div>

                      <button
                          v-if="testParts[activePartIndex].sections.length > 1"
                          @click="removeSection(activePartIndex, sectionIndex)"
                          class="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <!-- Section Title/Instruction -->
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Section Title/Instruction</label>
                      <textarea
                          v-model="section.title"
                          rows="2"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Questions 1–10 Complete the notes below..."
                      ></textarea>
                    </div>

                    <!-- Section Content -->
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Section Content/Context</label>
                      <textarea
                          v-model="section.content"
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          :placeholder="selectedTestType === 'listening'
            ? 'e.g., Listen to a conversation...'
            : 'e.g., Read the following passage...'"
                      ></textarea>
                    </div>

                    <!-- Section Image Upload -->
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Section Image (Optional)
                        <span class="text-xs text-gray-500">- For diagrams, maps, charts, etc.</span>
                      </label>

                      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <div v-if="section.imagePreview" class="mb-3">
                          <img :src="section.imagePreview" alt="Section Preview" class="max-h-48 mx-auto rounded" />
                          <p class="text-sm text-green-600 mt-2">Image uploaded for this section</p>
                          <p class="text-xs text-gray-500">File: {{ section.imageFile?.name }}</p>
                        </div>

                        <div v-else class="py-4">
                          <div class="text-4xl text-gray-400 mb-2">🖼️</div>
                          <p class="text-gray-500">Upload image for this section (optional)</p>
                          <p class="text-xs text-gray-400 mt-1">Useful for diagrams, maps, illustrations</p>
                        </div>

                        <div class="mt-4">
                          <label class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                            <input
                                type="file"
                                @change="(e) => handleSectionImageUpload(e, activePartIndex, sectionIndex)"
                                accept="image/*"
                                class="hidden"
                            />
                            {{ section.imagePreview ? 'Change Image' : 'Upload Image' }}
                          </label>

                          <button
                              v-if="section.imagePreview"
                              @click="removeSectionImage(activePartIndex, sectionIndex)"
                              class="ml-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Question Type Selection -->
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-2">Question Type for this Section</label>
                      <div class="flex flex-wrap gap-3">
                        <button
                            v-for="qType in questionTypes"
                            :key="qType.id"
                            @click="setSectionQuestionType(activePartIndex, sectionIndex, qType.id)"
                            class="px-4 py-2 text-sm border rounded-md transition-all"
                            :class="{
              'bg-blue-100 border-blue-500 text-blue-700': section.questionType === qType.id,
              'bg-white border-gray-300 text-gray-700': section.questionType !== qType.id
            }"
                        >
                          {{ qType.name }}
                        </button>
                      </div>
                    </div>

                    <!-- QUESTIONS UI (non-matching) -->
                    <div v-if="section.questionType !== 'matching'" class="space-y-4">
                      <div
                          v-for="(question, qIndex) in section.questions"
                          :key="qIndex"
                          class="border border-gray-200 rounded p-4 bg-gray-50"
                      >
                        <div class="flex justify-between items-center mb-2">
            <span class="font-medium text-gray-700">
              Question {{ getGlobalQuestionNumber(activePartIndex, sectionIndex, qIndex) }}
            </span>

                          <button
                              v-if="section.questions.length > 1"
                              @click="removeQuestion(activePartIndex, sectionIndex, qIndex)"
                              class="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>

                        <!-- Question Text -->
                        <div class="mb-3">
                          <input
                              v-model="question.text"
                              type="text"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Use {{1}}, {{2}} for blanks"
                          />
                        </div>

                        <!-- NOTE COMPLETION -->
                        <div v-if="section.questionType === 'note_completion'" class="mb-3">
                          <label class="block text-sm font-medium text-gray-700 mb-2">
                            Correct Answers (for {{1}}, {{2}} ...)
                          </label>

                          <div v-for="(answer, index) in question.answers" :key="index" class="flex gap-2 mb-2">
                            <input
                                v-model="question.answers[index]"
                                type="text"
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                :placeholder="`Answer for blank {{${index + 1}}}`"
                            />
                            <button
                                type="button"
                                class="px-3 py-2 bg-red-500 text-white rounded-md"
                                @click="question.answers.splice(index, 1)"
                            >
                              ✕
                            </button>
                          </div>

                          <button
                              type="button"
                              class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md"
                              @click="addBlank(question)"
                          >
                            + Add blank
                          </button>
                        </div>

                        <!-- MULTIPLE CHOICE -->
                        <div v-if="section.questionType === 'multiple_choice'" class="space-y-2">
                          <label class="block text-sm font-medium text-gray-700 mb-1">Options</label>

                          <div v-for="(option, optIndex) in question.options" :key="optIndex" class="flex items-center gap-3">
                            <div class="flex items-center">
                              <input
                                  type="radio"
                                  v-model="question.correctOption"
                                  :value="option.id"
                                  class="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              />
                              <span class="ml-2 text-gray-700">{{ String.fromCharCode(65 + optIndex) }}.</span>
                            </div>

                            <input
                                v-model="option.text"
                                type="text"
                                class="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                :placeholder="`Option ${String.fromCharCode(65 + optIndex)}`"
                            />

                            <button
                                v-if="question.options.length > 2"
                                @click="removeOption(activePartIndex, sectionIndex, qIndex, optIndex)"
                                class="text-red-500 hover:text-red-700"
                            >
                              &times;
                            </button>
                          </div>

                          <button
                              @click="addOption(activePartIndex, sectionIndex, qIndex)"
                              class="text-sm text-blue-600 hover:text-blue-800 mt-2"
                          >
                            + Add Option
                          </button>
                        </div>

                        <!-- SENTENCE COMPLETION -->
                        <div v-if="section.questionType === 'sentence_completion'" class="mb-3">
                          <label class="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                          <input
                              v-model="question.answer"
                              type="text"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter missing words to complete the sentence"
                          />
                        </div>

                        <!-- SHORT ANSWER -->
                        <div v-if="section.questionType === 'short_answer'" class="mb-3">
                          <label class="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                          <input
                              v-model="question.answer"
                              type="text"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter short answer"
                          />
                        </div>
                      </div>

                      <button
                          @click="addQuestion(activePartIndex, sectionIndex)"
                          class="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors"
                      >
                        + Add Question to this Section
                      </button>
                    </div>

                    <!-- MATCHING UI (SECTION LEVEL ONLY) -->
                    <div v-else class="space-y-6">
                      <div class="flex items-center justify-between">
                        <label class="block text-sm font-medium text-gray-700">
                          Matching (one set of options for the whole section)
                        </label>
                        <span class="text-xs text-gray-500">Items are Questions (15–20 etc.)</span>
                      </div>

                      <!-- OPTIONS -->
                      <div class="border rounded-lg p-4 bg-white">
                        <div class="flex items-center justify-between mb-3">
                          <div class="font-semibold text-gray-800">Options (A, B, C ...)</div>
                          <button
                              type="button"
                              @click="addMatchingOption(activePartIndex, sectionIndex)"
                              class="text-sm text-blue-600 hover:text-blue-800"
                          >
                            + Add Option
                          </button>
                        </div>

                        <div v-if="!(section.matchingOptions?.length)" class="text-sm text-gray-500">
                          Add at least 2 options.
                        </div>

                        <div v-for="(option, optIndex) in (section.matchingOptions || [])" :key="optIndex" class="flex items-center gap-2 mb-2">
            <span class="w-8 text-sm font-bold text-gray-700">
              {{ String.fromCharCode(65 + optIndex) }}.
            </span>

                          <input
                              v-model="option.text"
                              type="text"
                              class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                              :placeholder="`Option ${String.fromCharCode(65 + optIndex)}`"
                          />

                          <button
                              v-if="(section.matchingOptions || []).length > 2"
                              type="button"
                              @click="removeMatchingOption(activePartIndex, sectionIndex, optIndex)"
                              class="text-red-500 hover:text-red-700 text-lg"
                          >
                            &times;
                          </button>
                        </div>
                      </div>

                      <!-- QUESTIONS (items) -->
                      <div class="border rounded-lg p-4 bg-gray-50">
                        <div class="flex items-center justify-between mb-3">
                          <div class="font-semibold text-gray-800">Questions</div>
                          <span class="text-xs text-gray-500">Select correct letter for each question</span>
                        </div>

                        <div class="space-y-3">
                          <div
                              v-for="(question, qIndex) in section.questions"
                              :key="qIndex"
                              class="border border-gray-200 rounded p-4 bg-white"
                          >
                            <div class="flex justify-between items-center mb-2">
                <span class="font-medium text-gray-700">
                  Question {{ getGlobalQuestionNumber(activePartIndex, sectionIndex, qIndex) }}
                </span>

                              <button
                                  v-if="section.questions.length > 1"
                                  @click="removeQuestion(activePartIndex, sectionIndex, qIndex)"
                                  class="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>

                            <input
                                v-model="question.text"
                                type="text"
                                class="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Merrivales / The Lobster Pot / Elliots..."
                            />

                            <select
                                v-model="question.matchedOption"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                              <option disabled value="">Select correct option letter</option>
                              <option
                                  v-for="(op, optIndex) in (section.matchingOptions || [])"
                                  :key="optIndex"
                                  :value="String.fromCharCode(65 + optIndex)"
                              >
                                {{ String.fromCharCode(65 + optIndex) }}. {{ op.text }}
                              </option>
                            </select>
                          </div>
                        </div>

                        <button
                            type="button"
                            @click="addQuestion(activePartIndex, sectionIndex)"
                            class="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors"
                        >
                          + Add Question
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add Part Button -->
<!--              <button-->
<!--                  @click="addPart"-->
<!--                  class="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:text-blue-800 hover:border-blue-400 bg-blue-50 transition-colors"-->
<!--              >-->
<!--                + Add New Part-->
<!--              </button>-->
              <button
                  @click="addPart"
                  :disabled="testParts.length >= 4"
                  class="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:text-blue-800 hover:border-blue-400 bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add New Part
              </button>
            </div>
          </div>

          <!-- Writing Test Creation -->
          <div v-else-if="selectedTestType === 'writing'">
            <!-- (Оставил твою writing часть как была) -->
            <div class="space-y-8">
              <!-- Task 1 -->
              <div class="border-2 border-blue-200 rounded-lg p-5 bg-blue-50">
                <div class="flex items-center mb-4">
                  <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">1</div>
                  <h4 class="text-lg font-semibold text-blue-900">Writing Task 1</h4>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Task Title/Description</label>
                  <input
                      v-model="writingTasks.task1.title"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., The chart below shows..."
                  />
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Question/Task Description</label>
                  <textarea
                      v-model="writingTasks.task1.question"
                      rows="4"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Summarise the information..."
                  ></textarea>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Image/Chart for Task 1</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div v-if="writingTasks.task1.imagePreview" class="mb-3">
                      <img :src="writingTasks.task1.imagePreview" alt="Task 1 Preview" class="max-h-48 mx-auto rounded" />
                      <p class="text-sm text-green-600 mt-2">Image uploaded successfully</p>
                      <p class="text-xs text-gray-500">File: {{ writingTasks.task1.imageFile?.name }}</p>
                    </div>
                    <div v-else class="py-4">
                      <div class="text-4xl text-gray-400 mb-2">📊</div>
                      <p class="text-gray-500">Upload chart/diagram/image for Task 1</p>
                      <p class="text-xs text-gray-400 mt-1">Supports: JPG, PNG, GIF, SVG</p>
                    </div>
                    <div class="mt-4">
                      <label class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <input type="file" @change="handleTask1ImageUpload" accept="image/*" class="hidden" />
                        {{ writingTasks.task1.imagePreview ? 'Change Image' : 'Upload Image' }}
                      </label>
                      <button
                          v-if="writingTasks.task1.imagePreview"
                          @click="removeTask1Image"
                          class="ml-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Minimum Words</label>
                    <input
                        v-model="writingTasks.task1.minWords"
                        type="number"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="150"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Recommended Time (minutes)</label>
                    <input
                        v-model="writingTasks.task1.recommendedTime"
                        type="number"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="20"
                    />
                  </div>
                </div>
              </div>

              <!-- Task 2 -->
              <div class="border-2 border-green-200 rounded-lg p-5 bg-green-50">
                <div class="flex items-center mb-4">
                  <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mr-3">2</div>
                  <h4 class="text-lg font-semibold text-green-900">Writing Task 2</h4>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Task Title/Description</label>
                  <input
                      v-model="writingTasks.task2.title"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Some people believe that..."
                  />
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Question/Essay Prompt</label>
                  <textarea
                      v-model="writingTasks.task2.question"
                      rows="4"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., To what extent do you agree or disagree?..."
                  ></textarea>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Image for Task 2 (Optional)</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div v-if="writingTasks.task2.imagePreview" class="mb-3">
                      <img :src="writingTasks.task2.imagePreview" alt="Task 2 Preview" class="max-h-48 mx-auto rounded" />
                      <p class="text-sm text-green-600 mt-2">Image uploaded successfully</p>
                      <p class="text-xs text-gray-500">File: {{ writingTasks.task2.imageFile?.name }}</p>
                    </div>
                    <div v-else class="py-4">
                      <div class="text-4xl text-gray-400 mb-2">📝</div>
                      <p class="text-gray-500">Upload image for Task 2 (optional)</p>
                      <p class="text-xs text-gray-400 mt-1">Supports: JPG, PNG, GIF, SVG</p>
                    </div>
                    <div class="mt-4">
                      <label class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                        <input type="file" @change="handleTask2ImageUpload" accept="image/*" class="hidden" />
                        {{ writingTasks.task2.imagePreview ? 'Change Image' : 'Upload Image' }}
                      </label>
                      <button
                          v-if="writingTasks.task2.imagePreview"
                          @click="removeTask2Image"
                          class="ml-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Minimum Words</label>
                    <input
                        v-model="writingTasks.task2.minWords"
                        type="number"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="250"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Essay Type</label>
                    <select
                        v-model="writingTasks.task2.essayType"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="opinion">Opinion Essay</option>
                      <option value="discussion">Discussion Essay</option>
                      <option value="solution">Problem-Solution</option>
                      <option value="advantage">Advantage-Disadvantage</option>
                      <option value="two-part">Two-part Question</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Test Metadata -->
          <div class="mt-8 p-5 border rounded-lg bg-white">
            <h4 class="text-lg font-semibold text-gray-800 mb-4">Test Information</h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                <input
                    v-model="testTitle"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :placeholder="selectedTestType === 'writing'
                    ? 'e.g., IELTS Writing Practice Test 1'
                    : selectedTestType === 'listening'
                    ? 'e.g., IELTS Listening Practice Test 1'
                    : 'e.g., IELTS Reading Practice Test 1'"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                    v-model="testDuration"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    :placeholder="selectedTestType === 'writing' ? '60' : '30'"
                />
              </div>
            </div>

            <div v-if="selectedTestType === 'writing'" class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Writing Test Description</label>
              <textarea
                  v-model="writingDescription"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., This test contains two writing tasks..."
              ></textarea>
            </div>

            <div v-if="selectedTestType === 'listening'" class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Audio File (Optional)</label>
              <div class="flex items-center gap-3">
                <input
                    type="file"
                    @change="handleAudioUpload"
                    accept="audio/*"
                    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <span v-if="audioFileName" class="text-sm text-green-600">{{ audioFileName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-between mt-8 pt-4 border-t">
        <button v-if="step === 2" @click="step = 1" class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Back
        </button>
        <div v-else></div>

        <div class="flex gap-3">
          <CButton
              @click="closeModal"
              class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              text="Cancel"
              size="medium"
              variant="secondary"
          />

          <CButton
              v-if="step === 1"
              @click="nextStep"
              :disabled="!selectedTestType"
              text="Next"
              size="medium"
              class="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <CButton
              v-if="step === 2"
              @click="saveTest"
              :disabled="loading || !currentUser || currentUser?.profile?.role !== 'teacher'"
              :text="loading ? 'Saving...' : 'Save Test'"
              size="medium"
              :variant="loading ? 'disabled' : 'primary'"
              class="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import CButton from "@/components/forms/CButton.vue";
import { userService, testService } from "@/service/supabase.js";
import { supabase } from "@/service/supabase.js";

const emit = defineEmits(["close", "saved"]);

// State
const step = ref(1);
const selectedTestType = ref(null);
const testTitle = ref("");
const testDuration = ref(60);
const writingDescription = ref("");
const audioFileName = ref("");
const audioFile = ref(null);
const loading = ref(false);
const error = ref("");
const currentUser = ref(null);

// Test types
const testTypes = [
  { id: "listening", name: "Listening", icon: "👂", description: "Audio-based comprehension test" },
  { id: "reading", name: "Reading", icon: "📖", description: "Text-based comprehension test" },
  { id: "writing", name: "Writing", icon: "✍️", description: "Essay and report writing test" },
];

// Question types for Listening/Reading
const questionTypes = [
  { id: "note_completion", name: "Note Completion" },
  { id: "multiple_choice", name: "Multiple Choice" },
  { id: "matching", name: "Matching" },
  { id: "sentence_completion", name: "Sentence Completion" },
  { id: "short_answer", name: "Short Answer" },
  { id: "diagram_labeling", name: "Diagram Labeling" },
];

// Writing tasks
const writingTasks = reactive({
  task1: {
    title: "",
    question: "",
    imageFile: null,
    imagePreview: null,
    minWords: 150,
    recommendedTime: 20,
    description: "",
  },
  task2: {
    title: "",
    question: "",
    imageFile: null,
    imagePreview: null,
    minWords: 250,
    recommendedTime: 40,
    essayType: "opinion",
    description: "",
  },
});

onMounted(async () => {
  try {
    const user = await userService.getCurrentUser();
    currentUser.value = user;
  } catch (err) {
    console.error("Error getting user:", err);
    error.value = "Failed to load user information";
  }
});

// ---------- helpers ----------
const createEmptyQuestion = () => ({
  text: "",
  answers: [],         // note_completion
  options: [],         // multiple_choice
  correctOption: null, // multiple_choice
  matchedOption: "",   // matching: 'A'|'B'|'C'...
  answer: "",          // sentence_completion / short_answer (если используешь)
});

const createEmptySection = () => ({
  title: "",
  content: "",
  imageFile: null,
  imagePreview: null,
  questionType: "note_completion",
  questions: [createEmptyQuestion()],
  matchingOptions: [], // ✅ SECTION LEVEL
});

const createEmptyPart = () => ({
  description: "",
  sections: [createEmptySection()],
});

const testParts = reactive([createEmptyPart()]);

// ---------- actions ----------
const selectTestType = (type) => {
  selectedTestType.value = type;
  error.value = "";
};

const nextStep = () => {
  if (selectedTestType.value) {
    step.value = 2;
    error.value = "";
  }
};

// const addPart = () => testParts.push(createEmptyPart());
const MAX_PARTS_LR = 4

const addPart = () => {
  if (selectedTestType.value === 'writing') return
  if (testParts.length >= 4) return
  testParts.push(createEmptyPart())
  activePartIndex.value = testParts.length - 1
}

// const removePart = (index) => testParts.splice(index, 1);

const addSection = (partIndex) => testParts[partIndex].sections.push(createEmptySection());
const getGlobalSectionNumber = (partIndex, sectionIndex) => {
  let n = 0
  for (let p = 0; p < partIndex; p++) n += testParts[p].sections.length
  return n + sectionIndex + 1
}

const getGlobalQuestionNumber = (partIndex, sectionIndex, qIndex) => {
  let n = 0

  // all previous parts
  for (let p = 0; p < partIndex; p++) {
    for (let s = 0; s < testParts[p].sections.length; s++) {
      n += testParts[p].sections[s].questions.length
    }
  }

  // previous sections in current part
  for (let s = 0; s < sectionIndex; s++) {
    n += testParts[partIndex].sections[s].questions.length
  }

  return n + qIndex + 1
}
const activePartIndex = ref(0)

const nextPart = () => {
  if (activePartIndex.value < testParts.length - 1) activePartIndex.value++
}

const prevPart = () => {
  if (activePartIndex.value > 0) activePartIndex.value--
}

const removePart = (index) => {
  testParts.splice(index, 1)
  if (activePartIndex.value >= testParts.length) {
    activePartIndex.value = Math.max(0, testParts.length - 1)
  }
}
const removeSection = (partIndex, sectionIndex) => testParts[partIndex].sections.splice(sectionIndex, 1);

const handleSectionImageUpload = (event, partIndex, sectionIndex) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const section = testParts[partIndex].sections[sectionIndex];
  if (section.imagePreview) URL.revokeObjectURL(section.imagePreview);

  section.imageFile = file;
  section.imagePreview = URL.createObjectURL(file);
};

const removeSectionImage = (partIndex, sectionIndex) => {
  const section = testParts[partIndex].sections[sectionIndex];
  if (section.imagePreview) URL.revokeObjectURL(section.imagePreview);
  section.imageFile = null;
  section.imagePreview = null;
};

const addQuestion = (partIndex, sectionIndex) => {
  testParts[partIndex].sections[sectionIndex].questions.push(createEmptyQuestion());
};

const removeQuestion = (partIndex, sectionIndex, questionIndex) => {
  testParts[partIndex].sections[sectionIndex].questions.splice(questionIndex, 1);
};

// MCQ
const addOption = (partIndex, sectionIndex, questionIndex) => {
  const q = testParts[partIndex].sections[sectionIndex].questions[questionIndex];
  if (!Array.isArray(q.options)) q.options = [];
  q.options.push({ id: q.options.length, text: "" });
};

const removeOption = (partIndex, sectionIndex, questionIndex, optionIndex) => {
  testParts[partIndex].sections[sectionIndex].questions[questionIndex].options.splice(optionIndex, 1);
};

// MATCHING options (section level)
const addMatchingOption = (partIndex, sectionIndex) => {
  const section = testParts[partIndex].sections[sectionIndex];
  if (!Array.isArray(section.matchingOptions)) section.matchingOptions = [];
  section.matchingOptions.push({ text: "" });
};

const removeMatchingOption = (partIndex, sectionIndex, optIndex) => {
  const section = testParts[partIndex].sections[sectionIndex];
  section.matchingOptions.splice(optIndex, 1);

  // если удалили опцию — сбросим matchedOption у items которые могли ссылаться на букву
  const letters = new Set(section.matchingOptions.map((_, i) => String.fromCharCode(65 + i)));
  section.questions.forEach((q) => {
    if (q.matchedOption && !letters.has(q.matchedOption)) q.matchedOption = "";
  });
};

// when switching type: clean shape
const setSectionQuestionType = (partIndex, sectionIndex, type) => {
  const section = testParts[partIndex].sections[sectionIndex];
  section.questionType = type;

  // ensure there is at least 1 question
  if (!Array.isArray(section.questions) || !section.questions.length) {
    section.questions = [createEmptyQuestion()];
  }

  // reset per-type fields safely
  section.questions.forEach((q) => {
    if (!Array.isArray(q.answers)) q.answers = [];
    if (!Array.isArray(q.options)) q.options = [];
    if (q.correctOption === undefined) q.correctOption = null;
    if (q.matchedOption === undefined) q.matchedOption = "";
    if (q.answer === undefined) q.answer = "";
  });

  // matching options exist on section only
  if (type === "matching") {
    if (!Array.isArray(section.matchingOptions)) section.matchingOptions = [];
    // auto add 2 options for convenience
    if (section.matchingOptions.length < 2) {
      section.matchingOptions = [{ text: "" }, { text: "" }];
    }
  } else {
    section.matchingOptions = []; // не нужно для остальных типов
    // также сбросим matchedOption чтобы не мешало
    section.questions.forEach((q) => (q.matchedOption = ""));
  }
};

// Writing handlers
const handleTask1ImageUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  writingTasks.task1.imageFile = file;
  writingTasks.task1.imagePreview = URL.createObjectURL(file);
};

const removeTask1Image = () => {
  if (writingTasks.task1.imagePreview) URL.revokeObjectURL(writingTasks.task1.imagePreview);
  writingTasks.task1.imageFile = null;
  writingTasks.task1.imagePreview = null;
};

const handleTask2ImageUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  writingTasks.task2.imageFile = file;
  writingTasks.task2.imagePreview = URL.createObjectURL(file);
};

const removeTask2Image = () => {
  if (writingTasks.task2.imagePreview) URL.revokeObjectURL(writingTasks.task2.imagePreview);
  writingTasks.task2.imageFile = null;
  writingTasks.task2.imagePreview = null;
};

const handleAudioUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  audioFile.value = file;
  audioFileName.value = file.name;
};

const addBlank = (question) => {
  if (!Array.isArray(question.answers)) question.answers = [];
  question.answers.push("");
};

const closeModal = () => {
  emit("close");
  resetForm();
};

// ✅ IMPORTANT: partsPayload must include section.matchingOptions now
const buildPartsPayload = () =>
    testParts.map((p) => ({
      description: p.description,
      sections: p.sections.map((s) => ({
        title: s.title,
        content: s.content,
        questionType: s.questionType,
        matchingOptions: s.questionType === "matching" ? (s.matchingOptions || []) : [],
        questions: s.questions,
        imageFile: s.imageFile, // (не отправляем в testData, но держим для saveTest upload)
      })),
    }));

// const saveTest = async () => {
//   try {
//     loading.value = true;
//     error.value = "";
//
//     if (!currentUser.value) throw new Error("You must be logged in to create tests");
//     if (currentUser.value.profile?.role !== "teacher") throw new Error("Only teachers can create tests");
//     if (!testTitle.value.trim()) throw new Error("Test title is required");
//
//     // Validate questions exist
//     if (selectedTestType.value === "listening" || selectedTestType.value === "reading") {
//       let totalQuestions = 0;
//       testParts.forEach((part) => part.sections.forEach((section) => (totalQuestions += section.questions.length)));
//       if (totalQuestions === 0) throw new Error("At least one question is required");
//     }
//
//     // matching validation
//     testParts.forEach((p, pi) => {
//       p.sections.forEach((s, si) => {
//         if (s.questionType === "matching") {
//           const opts = (s.matchingOptions || []).filter((o) => (o.text ?? "").trim() !== "");
//           if (opts.length < 2) throw new Error(`Part ${pi + 1}, Section ${si + 1}: Matching needs at least 2 options`);
//
//           // each question should have matchedOption
//           s.questions.forEach((q, qi) => {
//             if (!q.text?.trim()) throw new Error(`Part ${pi + 1}, Section ${si + 1}: Item ${qi + 1} text is empty`);
//             if (!q.matchedOption) throw new Error(`Part ${pi + 1}, Section ${si + 1}: Item ${qi + 1} missing matched option`);
//           });
//         }
//       });
//     });
//
//     const userId = currentUser.value.id;
//
//     const partsPayload = buildPartsPayload();
//     const testData = {
//       title: testTitle.value,
//       duration: testDuration.value,
//       description: writingDescription.value,
//       parts: partsPayload.map((p) => ({
//         description: p.description,
//         sections: p.sections.map((s) => ({
//           title: s.title,
//           content: s.content,
//           questionType: s.questionType,
//           matchingOptions: s.matchingOptions || [],
//           questions: s.questions,
//         })),
//       })),
//     };
//
//     let result;
//
//     // ---------------- LISTENING ----------------
//     if (selectedTestType.value === "listening") {
//       const testResult = await testService.createListeningTest({ ...testData, audioUrl: null }, userId);
//       result = testResult;
//
//       if (audioFile.value) {
//         try {
//           const audioUrl = await testService.uploadAudio(audioFile.value, testResult.id);
//           await testService.updateListeningTestAudio(testResult.id, audioUrl);
//         } catch (e) {
//           console.error("Audio upload failed:", e);
//         }
//       }
//
//       // create sections/questions
//       for (let partIndex = 0; partIndex < testParts.length; partIndex++) {
//         const part = testParts[partIndex];
//
//         for (let sectionIndex = 0; sectionIndex < part.sections.length; sectionIndex++) {
//           const section = part.sections[sectionIndex];
//
//           let imageUrl = null;
//           if (section.imageFile) {
//             try {
//               imageUrl = await testService.uploadSectionImage(section.imageFile, testResult.id, partIndex + 1, sectionIndex + 1);
//             } catch (e) {
//               console.error("Section image upload failed:", e);
//             }
//           }
//
//           const sectionResult = await testService.createListeningSection(
//               { title: section.title, content: section.content, questionType: section.questionType, imageUrl },
//               testResult.id,
//               partIndex + 1,
//               sectionIndex + 1
//           );
//
//           for (let qIndex = 0; qIndex < section.questions.length; qIndex++) {
//             const q = section.questions[qIndex];
//
//             const createdQ = await testService.createListeningQuestion(
//                 { text: q.text, type: section.questionType, order_number: qIndex + 1 },
//                 sectionResult.id,
//                 qIndex + 1
//             );
//
//             if (section.questionType === "multiple_choice") {
//               await testService.createListeningOptions(createdQ.id, q.options, q.correctOption);
//             }
//
//             if (section.questionType === "note_completion") {
//               await testService.createListeningAnswers(createdQ.id, q.answers);
//             }
//
//             // ✅ SECTION LEVEL MATCHING (once)
//             if (section.questionType === "matching" && qIndex === 0) {
//               const createdOptions = await testService.createListeningMatchingOptions(createdQ.id, section.matchingOptions || []);
//               await testService.createListeningMatchingItems(createdQ.id, section.questions || [], createdOptions);
//             }
//           }
//         }
//       }
//     }
//
//     // ---------------- READING ----------------
//     else if (selectedTestType.value === "reading") {
//       const testResult = await testService.createReadingTest(testData, userId);
//       result = testResult;
//
//       for (let partIndex = 0; partIndex < testParts.length; partIndex++) {
//         const part = testParts[partIndex];
//
//         for (let sectionIndex = 0; sectionIndex < part.sections.length; sectionIndex++) {
//           const section = part.sections[sectionIndex];
//
//           let imageUrl = null;
//           if (section.imageFile) {
//             try {
//               imageUrl = await testService.uploadSectionImage(section.imageFile, testResult.id, partIndex + 1, sectionIndex + 1);
//             } catch (e) {
//               console.error("Section image upload failed:", e);
//             }
//           }
//
//           const sectionResult = await testService.createReadingSection(
//               { title: section.title, content: section.content, questionType: section.questionType, imageUrl },
//               testResult.id,
//               sectionIndex + 1
//           );
//
//           for (let qIndex = 0; qIndex < section.questions.length; qIndex++) {
//             const q = section.questions[qIndex];
//
//             const createdQ = await testService.createReadingQuestion(
//                 { text: q.text, type: section.questionType, order_number: qIndex + 1 },
//                 sectionResult.id,
//                 qIndex + 1
//             );
//
//             if (section.questionType === "note_completion") {
//               await testService.createReadingAnswers(createdQ.id, q.answers);
//             }
//
//             if (section.questionType === "multiple_choice") {
//               if (q.correctOption === undefined || q.correctOption === null) throw new Error("Correct option not selected");
//               const validOptions = (q.options || []).filter((opt) => opt.text && opt.text.trim() !== "");
//               await testService.createReadingOptions(createdQ.id, validOptions, q.correctOption);
//             }
//
//             // ✅ SECTION LEVEL MATCHING (once)
//             if (section.questionType === "matching" && qIndex === 0) {
//               const createdOptions = await testService.createReadingMatchingOptions(createdQ.id, section.matchingOptions || []);
//               await testService.createReadingMatchingItems(createdQ.id, section.questions || [], createdOptions);
//             }
//           }
//         }
//       }
//     }
//
//     // ---------------- WRITING ----------------
//     else if (selectedTestType.value === "writing") {
//       const testResult = await testService.createWritingTest(
//           {
//             ...testData,
//             tasks: {
//               task1: {
//                 title: writingTasks.task1.title,
//                 question: writingTasks.task1.question,
//                 minWords: writingTasks.task1.minWords,
//                 recommendedTime: writingTasks.task1.recommendedTime,
//                 imageUrl: null,
//               },
//               task2: {
//                 title: writingTasks.task2.title,
//                 question: writingTasks.task2.question,
//                 minWords: writingTasks.task2.minWords,
//                 recommendedTime: writingTasks.task2.recommendedTime,
//                 essayType: writingTasks.task2.essayType,
//                 imageUrl: null,
//               },
//             },
//           },
//           userId
//       );
//
//       result = testResult;
//
//       if (writingTasks.task1.imageFile) {
//         try {
//           const url = await testService.uploadWritingImage(writingTasks.task1.imageFile, testResult.id, 1);
//           await testService.updateWritingTestImage(testResult.id, 1, url);
//         } catch (e) {
//           console.error("Task 1 image upload failed:", e);
//         }
//       }
//
//       if (writingTasks.task2.imageFile) {
//         try {
//           const url = await testService.uploadWritingImage(writingTasks.task2.imageFile, testResult.id, 2);
//           await testService.updateWritingTestImage(testResult.id, 2, url);
//         } catch (e) {
//           console.error("Task 2 image upload failed:", e);
//         }
//       }
//     }
//
//     emit("saved", { type: selectedTestType.value, id: result.id, title: testTitle.value });
//     alert(`${selectedTestType.value.charAt(0).toUpperCase() + selectedTestType.value.slice(1)} test created successfully!`);
//     resetForm();
//   } catch (err) {
//     console.error("Error saving test:", err);
//     error.value = err.message || "Failed to save test. Please try again.";
//     alert(`Error: ${err.message}\n\nCheck console for details.`);
//   } finally {
//     loading.value = false;
//   }
//
//   // optional debug
//   try {
//     const { data: buckets } = await supabase.storage.listBuckets();
//     console.log("Available buckets:", buckets?.map((b) => b.name));
//   } catch (e) {
//     // ignore
//   }
// };
const saveTest = async () => {
  try {
    loading.value = true;
    error.value = "";

    if (!currentUser.value) throw new Error("You must be logged in to create tests");
    if (currentUser.value.profile?.role !== "teacher") throw new Error("Only teachers can create tests");
    if (!testTitle.value.trim()) throw new Error("Test title is required");

    // Validate questions exist
    if (selectedTestType.value === "listening" || selectedTestType.value === "reading") {
      let totalQuestions = 0;
      testParts.forEach((part) => part.sections.forEach((section) => (totalQuestions += section.questions.length)));
      if (totalQuestions === 0) throw new Error("At least one question is required");
    }

    // matching validation
    testParts.forEach((p, pi) => {
      p.sections.forEach((s, si) => {
        if (s.questionType === "matching") {
          const opts = (s.matchingOptions || []).filter((o) => (o.text ?? "").trim() !== "");
          if (opts.length < 2) throw new Error(`Part ${pi + 1}, Section ${si + 1}: Matching needs at least 2 options`);

          s.questions.forEach((q, qi) => {
            if (!q.text?.trim()) throw new Error(`Part ${pi + 1}, Section ${si + 1}: Question ${qi + 1} text is empty`);
            if (!q.matchedOption) throw new Error(`Part ${pi + 1}, Section ${si + 1}: Question ${qi + 1} missing matched option`);
          });
        }
      });
    });

    const userId = currentUser.value.id;

    const partsPayload = buildPartsPayload();
    const testData = {
      title: testTitle.value,
      duration: testDuration.value,
      description: writingDescription.value,
      parts: partsPayload.map((p) => ({
        description: p.description,
        sections: p.sections.map((s) => ({
          title: s.title,
          content: s.content,
          questionType: s.questionType,
          matchingOptions: s.matchingOptions || [],
          questions: s.questions,
        })),
      })),
    };

    let result;

    // ---------------- LISTENING ----------------
    if (selectedTestType.value === "listening") {
      const testResult = await testService.createListeningTest({ ...testData, audioUrl: null }, userId);
      result = testResult;

      if (audioFile.value) {
        try {
          const audioUrl = await testService.uploadAudio(audioFile.value, testResult.id);
          await testService.updateListeningTestAudio(testResult.id, audioUrl);
        } catch (e) {
          console.error("Audio upload failed:", e);
        }
      }

      for (let partIndex = 0; partIndex < testParts.length; partIndex++) {
        const part = testParts[partIndex];

        for (let sectionIndex = 0; sectionIndex < part.sections.length; sectionIndex++) {
          const section = part.sections[sectionIndex];

          let imageUrl = null;
          if (section.imageFile) {
            try {
              imageUrl = await testService.uploadSectionImage(
                  section.imageFile,
                  testResult.id,
                  partIndex + 1,
                  sectionIndex + 1
              );
            } catch (e) {
              console.error("Section image upload failed:", e);
            }
          }

          const sectionResult = await testService.createListeningSection(
              { title: section.title, content: section.content, questionType: section.questionType, imageUrl },
              testResult.id,
              partIndex + 1,
              sectionIndex + 1
          );

          for (let qIndex = 0; qIndex < section.questions.length; qIndex++) {
            const q = section.questions[qIndex];

            const createdQ = await testService.createListeningQuestion(
                { text: q.text, type: section.questionType, order_number: qIndex + 1 },
                sectionResult.id,
                qIndex + 1
            );

            if (section.questionType === "multiple_choice") {
              await testService.createListeningOptions(createdQ.id, q.options, q.correctOption);
            }

            if (section.questionType === "note_completion") {
              await testService.createListeningAnswers(createdQ.id, q.answers);
            }

            // ✅ MATCHING (SECTION LEVEL) — сохранить ОДИН РАЗ на секцию + correct_option_id
            if (section.questionType === "matching" && qIndex === 0) {
              // 1) создаём options (A,B,C...) и получаем rows с option_label + id
              const createdOptions = await testService.createListeningMatchingOptions(
                  createdQ.id,
                  section.matchingOptions || []
              );

              const labelToId = new Map();
              (createdOptions || []).forEach((op) => {
                if (op.option_label) labelToId.set(op.option_label, op.id);
              });

              // 2) создаём items из section.questions (каждый question = item)
              const itemsPayload = (section.questions || [])
                  .filter((it) => (it.text || "").trim() !== "")
                  .map((it) => ({
                    question_id: createdQ.id, // anchor question
                    item_text: it.text,
                    correct_option_id: it.matchedOption ? (labelToId.get(it.matchedOption) || null) : null,
                  }));

              const { error: miErr } = await supabase
                  .from("listening_matching_items")
                  .insert(itemsPayload);

              if (miErr) throw miErr;
            }
          }
        }
      }
    }

    // ---------------- READING ----------------
    else if (selectedTestType.value === "reading") {
      const testResult = await testService.createReadingTest(testData, userId);
      result = testResult;

      for (let partIndex = 0; partIndex < testParts.length; partIndex++) {
        const part = testParts[partIndex];

        for (let sectionIndex = 0; sectionIndex < part.sections.length; sectionIndex++) {
          const section = part.sections[sectionIndex];

          let imageUrl = null;
          if (section.imageFile) {
            try {
              imageUrl = await testService.uploadSectionImage(
                  section.imageFile,
                  testResult.id,
                  partIndex + 1,
                  sectionIndex + 1
              );
            } catch (e) {
              console.error("Section image upload failed:", e);
            }
          }

          const sectionResult = await testService.createReadingSection(
              { title: section.title, content: section.content, questionType: section.questionType, imageUrl },
              testResult.id,
              sectionIndex + 1
          );

          for (let qIndex = 0; qIndex < section.questions.length; qIndex++) {
            const q = section.questions[qIndex];

            const createdQ = await testService.createReadingQuestion(
                { text: q.text, type: section.questionType, order_number: qIndex + 1 },
                sectionResult.id,
                qIndex + 1
            );

            if (section.questionType === "note_completion") {
              await testService.createReadingAnswers(createdQ.id, q.answers);
            }

            if (section.questionType === "multiple_choice") {
              if (q.correctOption === undefined || q.correctOption === null) throw new Error("Correct option not selected");
              const validOptions = (q.options || []).filter((opt) => opt.text && opt.text.trim() !== "");
              await testService.createReadingOptions(createdQ.id, validOptions, q.correctOption);
            }

            // ✅ MATCHING (SECTION LEVEL) — сохранить ОДИН РАЗ на секцию + correct_option_id
            if (section.questionType === "matching" && qIndex === 0) {
              const createdOptions = await testService.createReadingMatchingOptions(
                  createdQ.id,
                  section.matchingOptions || []
              );

              const labelToId = new Map();
              (createdOptions || []).forEach((op) => {
                if (op.option_label) labelToId.set(op.option_label, op.id);
              });

              const itemsPayload = (section.questions || [])
                  .filter((it) => (it.text || "").trim() !== "")
                  .map((it) => ({
                    question_id: createdQ.id,
                    item_text: it.text,
                    correct_option_id: it.matchedOption ? (labelToId.get(it.matchedOption) || null) : null,
                  }));

              const { error: miErr } = await supabase
                  .from("reading_matching_items")
                  .insert(itemsPayload);

              if (miErr) throw miErr;
            }
          }
        }
      }
    }

    // ---------------- WRITING ----------------
    else if (selectedTestType.value === "writing") {
      const testResult = await testService.createWritingTest(
          {
            ...testData,
            tasks: {
              task1: {
                title: writingTasks.task1.title,
                question: writingTasks.task1.question,
                minWords: writingTasks.task1.minWords,
                recommendedTime: writingTasks.task1.recommendedTime,
                imageUrl: null,
              },
              task2: {
                title: writingTasks.task2.title,
                question: writingTasks.task2.question,
                minWords: writingTasks.task2.minWords,
                recommendedTime: writingTasks.task2.recommendedTime,
                essayType: writingTasks.task2.essayType,
                imageUrl: null,
              },
            },
          },
          userId
      );

      result = testResult;

      if (writingTasks.task1.imageFile) {
        try {
          const url = await testService.uploadWritingImage(writingTasks.task1.imageFile, testResult.id, 1);
          await testService.updateWritingTestImage(testResult.id, 1, url);
        } catch (e) {
          console.error("Task 1 image upload failed:", e);
        }
      }

      if (writingTasks.task2.imageFile) {
        try {
          const url = await testService.uploadWritingImage(writingTasks.task2.imageFile, testResult.id, 2);
          await testService.updateWritingTestImage(testResult.id, 2, url);
        } catch (e) {
          console.error("Task 2 image upload failed:", e);
        }
      }
    }

    emit("saved", { type: selectedTestType.value, id: result.id, title: testTitle.value });
    alert(`${selectedTestType.value.charAt(0).toUpperCase() + selectedTestType.value.slice(1)} test created successfully!`);
    resetForm();
  } catch (err) {
    console.error("Error saving test:", err);
    error.value = err.message || "Failed to save test. Please try again.";
    alert(`Error: ${err.message}\n\nCheck console for details.`);
  } finally {
    loading.value = false;
  }

  // optional debug
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log("Available buckets:", buckets?.map((b) => b.name));
  } catch (e) {
    // ignore
  }
};

const resetForm = () => {
  selectedTestType.value = null;
  testTitle.value = "";
  testDuration.value = 60;
  writingDescription.value = "";
  audioFileName.value = "";
  audioFile.value = null;
  loading.value = false;
  error.value = "";

  // clean previews
  testParts.forEach((part) =>
      part.sections.forEach((section) => {
        if (section.imagePreview) URL.revokeObjectURL(section.imagePreview);
      })
  );

  // reset parts with correct shape
  testParts.splice(0, testParts.length, createEmptyPart());

  // reset writing tasks
  if (writingTasks.task1.imagePreview) URL.revokeObjectURL(writingTasks.task1.imagePreview);
  if (writingTasks.task2.imagePreview) URL.revokeObjectURL(writingTasks.task2.imagePreview);

  writingTasks.task1 = {
    title: "",
    question: "",
    imageFile: null,
    imagePreview: null,
    minWords: 150,
    recommendedTime: 20,
    description: "",
  };

  writingTasks.task2 = {
    title: "",
    question: "",
    imageFile: null,
    imagePreview: null,
    minWords: 250,
    recommendedTime: 40,
    essayType: "opinion",
    description: "",
  };

  step.value = 1;
};
</script>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
img {
  object-fit: contain;
  max-width: 100%;
}
</style>
