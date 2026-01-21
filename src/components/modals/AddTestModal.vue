AddTestModal.vue:
<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-4/5 max-w-6xl shadow-lg rounded-md bg-white h-[90vh] overflow-y-scroll">
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

          <div v-else-if="currentUser?.profile?.role !== 'teacher'" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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
            <!-- Test Parts Management -->
            <div class="space-y-8">
              <div v-for="(part, partIndex) in testParts" :key="partIndex" class="border rounded-lg p-5 bg-gray-50">
                <!-- Part Header -->
                <div class="flex justify-between items-center mb-4">
                  <div class="flex items-center">
                    <h4 class="text-lg font-semibold text-gray-800 mr-3">Part {{ partIndex + 1 }}</h4>
                    <span class="text-sm text-gray-500">({{ part.sections.length }} section{{ part.sections.length !== 1 ? 's' : '' }})</span>
                  </div>
                  <div class="flex gap-2">
                    <button
                        @click="addSection(partIndex)"
                        class="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Section
                    </button>
                    <button
                        v-if="testParts.length > 1"
                        @click="removePart(partIndex)"
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
                      v-model="part.description"
                      rows="2"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., You will hear a conversation between a travel agent and a customer..."
                  ></textarea>
                </div>

                <!-- Sections within Part -->
                <div class="space-y-6">
                  <div v-for="(section, sectionIndex) in part.sections" :key="sectionIndex" class="border-l-4 border-blue-400 pl-4 py-4 bg-white rounded-r">
                    <!-- Section Header -->
                    <div class="flex justify-between items-center mb-3">
                      <div class="flex items-center">
                        <div class="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs mr-2">
                          {{ sectionIndex + 1 }}
                        </div>
                        <h5 class="font-medium text-gray-800">Section {{ sectionIndex + 1 }}</h5>
                      </div>
                      <button
                          v-if="part.sections.length > 1"
                          @click="removeSection(partIndex, sectionIndex)"
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
                          placeholder="e.g., Questions 1–10 Complete the notes below. Write no more than TWO WORDS AND/OR A NUMBER for each answer."
                      ></textarea>
                    </div>

                    <!-- Section Content (e.g., reading passage, listening context) -->
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Section Content/Context</label>
                      <textarea
                          v-model="section.content"
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          :placeholder="selectedTestType === 'listening'
                          ? 'e.g., Listen to a conversation between a travel agent and a customer...'
                          : 'e.g., Read the following passage about cycling holidays...'"
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
                          <img :src="section.imagePreview" alt="Section Preview" class="max-h-48 mx-auto rounded">
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
                                @change="(e) => handleSectionImageUpload(e, partIndex, sectionIndex)"
                                accept="image/*"
                                class="hidden"
                            >
                            {{ section.imagePreview ? 'Change Image' : 'Upload Image' }}
                          </label>
                          <button
                              v-if="section.imagePreview"
                              @click="removeSectionImage(partIndex, sectionIndex)"
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
                            @click="section.questionType = qType.id"
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

                    <!-- Questions for this Section -->
                    <div class="space-y-4">
                      <div v-for="(question, qIndex) in section.questions" :key="qIndex" class="border border-gray-200 rounded p-4 bg-gray-50">
                        <div class="flex justify-between items-center mb-2">
                          <span class="font-medium text-gray-700">Question {{ qIndex + 1 }}</span>
                          <button
                              v-if="section.questions.length > 1"
                              @click="removeQuestion(partIndex, sectionIndex, qIndex)"
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

                        <!-- Answer Input (for note completion) -->
                        <div v-if="section.questionType === 'note_completion'" class="mb-3">
                          <label class="block text-sm font-medium text-gray-700 mb-2">
                            Correct Answers (for {{1}}, {{2}} ...)
                          </label>

                          <div
                              v-for="(answer, index) in question.answers"
                              :key="index"
                              class="flex gap-2 mb-2"
                          >
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


                        <!-- Multiple Choice Options -->
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
                                @click="removeOption(partIndex, sectionIndex, qIndex, optIndex)"
                                class="text-red-500 hover:text-red-700"
                            >
                              &times;
                            </button>
                          </div>
                          <button
                              @click="addOption(partIndex, sectionIndex, qIndex)"
                              class="text-sm text-blue-600 hover:text-blue-800 mt-2"
                          >
                            + Add Option
                          </button>
                        </div>

                        <!-- Matching Options -->
                        <div v-if="section.questionType === 'matching'" class="space-y-3">
                          <label class="block text-sm font-medium text-gray-700 mb-1">Matching Pairs</label>
                          <div class="grid grid-cols-2 gap-4">
                            <!-- Left Column (Items) -->
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-2">Items to Match</label>
                              <div v-for="(item, itemIndex) in question.matchingItems" :key="itemIndex" class="mb-2">
                                <input
                                    v-model="item.name"
                                    type="text"
                                    class="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    :placeholder="`Item ${itemIndex + 1}`"
                                />
                              </div>
                              <button
                                  @click="addMatchingItem(partIndex, sectionIndex, qIndex)"
                                  class="text-sm text-blue-600 hover:text-blue-800"
                              >
                                + Add Item
                              </button>
                            </div>

                            <!-- Right Column (Options) -->
                            <div>
                              <label class="block text-sm font-medium text-gray-700 mb-2">Options to Match With</label>
                              <div v-for="(option, optIndex) in question.matchingOptions" :key="optIndex" class="mb-2">
                                <div class="flex items-center gap-2">
                                  <input
                                      type="checkbox"
                                      v-model="option.selected"
                                      class="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <input
                                      v-model="option.text"
                                      type="text"
                                      class="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      :placeholder="`Option ${optIndex + 1}`"
                                  />
                                  <button
                                      @click="removeMatchingOption(partIndex, sectionIndex, qIndex, optIndex)"
                                      class="text-red-500 hover:text-red-700"
                                  >
                                    &times;
                                  </button>
                                </div>
                              </div>
                              <button
                                  @click="addMatchingOption(partIndex, sectionIndex, qIndex)"
                                  class="text-sm text-blue-600 hover:text-blue-800"
                              >
                                + Add Option
                              </button>
                            </div>
                          </div>
                        </div>

                        <!-- Sentence Completion -->
                        <div v-if="section.questionType === 'sentence_completion'" class="mb-3">
                          <label class="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                          <input
                              v-model="question.answer"
                              type="text"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter missing words to complete the sentence"
                          />
                        </div>

                        <!-- Short Answer -->
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

                      <!-- Add Question Button -->
                      <button
                          @click="addQuestion(partIndex, sectionIndex)"
                          class="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors"
                      >
                        + Add Question to Section {{ sectionIndex + 1 }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add Part Button -->
              <button
                  @click="addPart"
                  class="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:text-blue-800 hover:border-blue-400 bg-blue-50 transition-colors"
              >
                + Add New Part
              </button>
            </div>
          </div>

          <!-- Writing Test Creation -->
          <div v-else-if="selectedTestType === 'writing'">
            <div class="space-y-8">
              <!-- Task 1 -->
              <div class="border-2 border-blue-200 rounded-lg p-5 bg-blue-50">
                <div class="flex items-center mb-4">
                  <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                    1
                  </div>
                  <h4 class="text-lg font-semibold text-blue-900">Writing Task 1</h4>
                </div>

                <!-- Task 1 Title -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Task Title/Description</label>
                  <input
                      v-model="writingTasks.task1.title"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., The chart below shows..."
                  />
                </div>

                <!-- Task 1 Question -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Question/Task Description</label>
                  <textarea
                      v-model="writingTasks.task1.question"
                      rows="4"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Summarise the information by selecting and reporting the main features, and make comparisons where relevant."
                  ></textarea>
                </div>

                <!-- Task 1 Image Upload -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Image/Chart for Task 1</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div v-if="writingTasks.task1.imagePreview" class="mb-3">
                      <img :src="writingTasks.task1.imagePreview" alt="Task 1 Preview" class="max-h-48 mx-auto rounded">
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
                        <input
                            type="file"
                            @change="handleTask1ImageUpload"
                            accept="image/*"
                            class="hidden"
                        >
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

                <!-- Task 1 Word Count -->
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
                  <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mr-3">
                    2
                  </div>
                  <h4 class="text-lg font-semibold text-green-900">Writing Task 2</h4>
                </div>

                <!-- Task 2 Title -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Task Title/Description</label>
                  <input
                      v-model="writingTasks.task2.title"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Some people believe that..."
                  />
                </div>

                <!-- Task 2 Question -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Question/Essay Prompt</label>
                  <textarea
                      v-model="writingTasks.task2.question"
                      rows="4"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience."
                  ></textarea>
                </div>

                <!-- Task 2 Image Upload -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Image for Task 2 (Optional)</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div v-if="writingTasks.task2.imagePreview" class="mb-3">
                      <img :src="writingTasks.task2.imagePreview" alt="Task 2 Preview" class="max-h-48 mx-auto rounded">
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
                        <input
                            type="file"
                            @change="handleTask2ImageUpload"
                            accept="image/*"
                            class="hidden"
                        >
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

                <!-- Task 2 Word Count & Essay Type -->
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
                  placeholder="e.g., This test contains two writing tasks. Task 1 requires you to describe visual information. Task 2 requires you to write an essay in response to a point of view, argument or problem."
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
        <button
            v-if="step === 2"
            @click="step = 1"
            class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
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
import { ref, reactive, onMounted } from 'vue'
import CButton from "@/components/forms/CButton.vue"
import { userService, testService } from '@/service/supabase.js'
import { supabase } from '@/service/supabase.js' // ADD THIS LINE
// Emits
const emit = defineEmits(['close', 'saved'])

// State
const step = ref(1)
const selectedTestType = ref(null)
const testTitle = ref('')
const testDuration = ref(60)
const writingDescription = ref('')
const audioFileName = ref('')
const audioFile = ref(null)
const loading = ref(false)
const error = ref('')
const currentUser = ref(null)

// Test types
const testTypes = [
  { id: 'listening', name: 'Listening', icon: '👂', description: 'Audio-based comprehension test' },
  { id: 'reading', name: 'Reading', icon: '📖', description: 'Text-based comprehension test' },
  { id: 'writing', name: 'Writing', icon: '✍️', description: 'Essay and report writing test' }
]

// Question types for Listening/Reading
const questionTypes = [
  { id: 'note_completion', name: 'Note Completion' },
  { id: 'multiple_choice', name: 'Multiple Choice' },
  { id: 'matching', name: 'Matching' },
  { id: 'sentence_completion', name: 'Sentence Completion' },
  { id: 'short_answer', name: 'Short Answer' },
  { id: 'diagram_labeling', name: 'Diagram Labeling' }
]

// Test parts structure for Listening/Reading


// Writing tasks structure
const writingTasks = reactive({
  task1: {
    title: '',
    question: '',
    imageFile: null,
    imagePreview: null,
    minWords: 150,
    recommendedTime: 20,
    description: ''
  },
  task2: {
    title: '',
    question: '',
    imageFile: null,
    imagePreview: null,
    minWords: 250,
    recommendedTime: 40,
    essayType: 'opinion',
    description: ''
  }
})

// Get current user on mount
onMounted(async () => {
  try {
    const user = await userService.getCurrentUser()
    currentUser.value = user
  } catch (err) {
    console.error('Error getting user:', err)
    error.value = 'Failed to load user information'
  }
})

// Methods for Listening/Reading
const selectTestType = (type) => {
  selectedTestType.value = type
  error.value = ''
}

const nextStep = () => {
  if (selectedTestType.value) {
    step.value = 2
    error.value = ''
  }
}

const addPart = () => {
  testParts.push(createEmptyPart())
}

const removePart = (index) => {
  testParts.splice(index, 1)
}
const createEmptyQuestion = () => ({
  text: '',
  answers: [],           // ✅ ВСЕГДА СУЩЕСТВУЕТ
  options: [],
  correctOption: null,
  matchingItems: [],
  matchingOptions: []
})

const createEmptySection = () => ({
  title: '',
  content: '',
  imageFile: null,
  imagePreview: null,
  questionType: 'note_completion',
  questions: [createEmptyQuestion()]
})

const createEmptyPart = () => ({
  description: '',
  sections: [createEmptySection()]
})

const testParts = reactive([createEmptyPart()])

const addSection = (partIndex) => {
  testParts[partIndex].sections.push(createEmptySection())
}

const removeSection = (partIndex, sectionIndex) => {
  testParts[partIndex].sections.splice(sectionIndex, 1)
}

const handleSectionImageUpload = (event, partIndex, sectionIndex) => {
  const file = event.target.files[0]
  if (file) {
    const section = testParts[partIndex].sections[sectionIndex]

    // Clean up previous image if exists
    if (section.imagePreview) {
      URL.revokeObjectURL(section.imagePreview)
    }

    section.imageFile = file
    section.imagePreview = URL.createObjectURL(file)
  }
}

const removeSectionImage = (partIndex, sectionIndex) => {
  const section = testParts[partIndex].sections[sectionIndex]
  if (section.imagePreview) {
    URL.revokeObjectURL(section.imagePreview)
  }
  section.imageFile = null
  section.imagePreview = null
}

// const addQuestion = (partIndex, sectionIndex) => {
//   testParts[partIndex].sections[sectionIndex].questions.push({
//     text: '',
//     answer: '',
//     options: [],
//     correctOption: null,
//     matchingItems: [],
//     matchingOptions: []
//   })
// }
// In your component script, update the question structure
const addQuestion = (partIndex, sectionIndex) => {
  testParts[partIndex].sections[sectionIndex].questions.push(
      createEmptyQuestion()
  )
}

const removeQuestion = (partIndex, sectionIndex, questionIndex) => {
  testParts[partIndex].sections[sectionIndex].questions.splice(questionIndex, 1)
}

const addOption = (partIndex, sectionIndex, questionIndex) => {
  const question = testParts[partIndex].sections[sectionIndex].questions[questionIndex]
  question.options.push({
    id: question.options.length,
    text: ''
  })
}

const removeOption = (partIndex, sectionIndex, questionIndex, optionIndex) => {
  testParts[partIndex].sections[sectionIndex].questions[questionIndex].options.splice(optionIndex, 1)
}

const addMatchingItem = (partIndex, sectionIndex, questionIndex) => {
  testParts[partIndex].sections[sectionIndex].questions[questionIndex].matchingItems.push({
    name: '',
    matchedOption: null
  })
}

const removeMatchingItem = (partIndex, sectionIndex, questionIndex, itemIndex) => {
  testParts[partIndex].sections[sectionIndex].questions[questionIndex].matchingItems.splice(itemIndex, 1)
}

const addMatchingOption = (partIndex, sectionIndex, questionIndex) => {
  testParts[partIndex].sections[sectionIndex].questions[questionIndex].matchingOptions.push({
    text: '',
    selected: false
  })
}

const removeMatchingOption = (partIndex, sectionIndex, questionIndex, optionIndex) => {
  testParts[partIndex].sections[sectionIndex].questions[questionIndex].matchingOptions.splice(optionIndex, 1)
}

// Methods for Writing
const handleTask1ImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    writingTasks.task1.imageFile = file
    writingTasks.task1.imagePreview = URL.createObjectURL(file)
  }
}

const removeTask1Image = () => {
  if (writingTasks.task1.imagePreview) {
    URL.revokeObjectURL(writingTasks.task1.imagePreview)
  }
  writingTasks.task1.imageFile = null
  writingTasks.task1.imagePreview = null
}

const handleTask2ImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    writingTasks.task2.imageFile = file
    writingTasks.task2.imagePreview = URL.createObjectURL(file)
  }
}

const removeTask2Image = () => {
  if (writingTasks.task2.imagePreview) {
    URL.revokeObjectURL(writingTasks.task2.imagePreview)
  }
  writingTasks.task2.imageFile = null
  writingTasks.task2.imagePreview = null
}

const handleAudioUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    audioFile.value = file
    audioFileName.value = file.name
  }
}

const getQuestionPlaceholder = (type, index) => {
  switch (type) {
    case 'note_completion':
      return `e.g., Holiday begins on...`
    case 'multiple_choice':
      return `e.g., The market is now situated...`
    case 'matching':
      return `e.g., Which advantage is mentioned for each restaurant?`
    case 'sentence_completion':
      return `e.g., Complete the sentence: The cycling holiday costs...`
    case 'short_answer':
      return `e.g., How many people are in the cycling group?`
    case 'diagram_labeling':
      return `e.g., Label the diagram: Part A is called...`
    default:
      return `Enter question ${index + 1}`
  }
}

const closeModal = () => {
  emit('close')
  resetForm()
}
const saveTest = async () => {
  try {
    loading.value = true
    error.value = ''

    // Validate user
    if (!currentUser.value) {
      throw new Error('You must be logged in to create tests')
    }

    if (currentUser.value.profile?.role !== 'teacher') {
      throw new Error('Only teachers can create tests')
    }

    // Validate required fields
    if (!testTitle.value.trim()) {
      throw new Error('Test title is required')
    }

    // Debug: Check all files
    console.log('=== DEBUG: Checking all files ===')
    console.log('1. Audio file:', audioFile.value ? `${audioFile.value.name} (${audioFile.value.size} bytes)` : 'No audio')
    console.log('2. Writing Task 1 image:', writingTasks.task1.imageFile ? `${writingTasks.task1.imageFile.name} (${writingTasks.task1.imageFile.size} bytes)` : 'No image')
    console.log('3. Writing Task 2 image:', writingTasks.task2.imageFile ? `${writingTasks.task2.imageFile.name} (${writingTasks.task2.imageFile.size} bytes)` : 'No image')

    let sectionImageCount = 0
    testParts.forEach((part, partIndex) => {
      part.sections.forEach((section, sectionIndex) => {
        if (section.imageFile) {
          sectionImageCount++
          console.log(`4.${sectionImageCount} Part ${partIndex + 1}, Section ${sectionIndex + 1}:`,
              `${section.imageFile.name} (${section.imageFile.size} bytes)`)
        }
      })
    })
    console.log('Total section images:', sectionImageCount)
    console.log('=== END DEBUG ===')

    if (selectedTestType.value === 'listening' || selectedTestType.value === 'reading') {
      // Validate at least one question exists
      let totalQuestions = 0
      testParts.forEach(part => {
        part.sections.forEach(section => {
          totalQuestions += section.questions.length
        })
      })

      if (totalQuestions === 0) {
        throw new Error('At least one question is required')
      }
    }

    const userId = currentUser.value.id

    // Prepare test data based on type
    const testData = {
      title: testTitle.value,
      duration: testDuration.value,
      description: writingDescription.value
    }

    let result

    if (selectedTestType.value === 'listening') {
      console.log('=== Creating Listening Test ===')

      // Create listening test first (without audio URL initially)
      const testResult = await testService.createListeningTest({
        ...testData,
        audioUrl: null // Initialize as null, will update later
      }, userId)

      console.log('Listening test created with ID:', testResult.id)
      result = testResult

      // Upload audio file if exists
      if (audioFile.value) {
        console.log('Uploading audio file...')
        try {
          const audioUrl = await testService.uploadAudio(audioFile.value, testResult.id)
          console.log('Audio uploaded successfully. URL:', audioUrl)

          // Update test with audio URL using the service function
          await testService.updateListeningTestAudio(testResult.id, audioUrl)
          console.log('Audio URL updated in database')

        } catch (uploadError) {
          console.error('Audio upload failed:', uploadError)
          // Continue without audio
        }
      }

      // Create sections and questions
      for (let partIndex = 0; partIndex < testParts.length; partIndex++) {
        const part = testParts[partIndex]

        for (let sectionIndex = 0; sectionIndex < part.sections.length; sectionIndex++) {
          const section = part.sections[sectionIndex]

          // Upload section image if exists
          let imageUrl = null
          if (section.imageFile) {
            console.log(`Uploading image for Part ${partIndex + 1}, Section ${sectionIndex + 1}...`)
            try {
              imageUrl = await testService.uploadSectionImage(
                  section.imageFile,
                  testResult.id,
                  partIndex + 1,
                  sectionIndex + 1
              )
              console.log('Section image uploaded. URL:', imageUrl)
            } catch (uploadError) {
              console.error('Section image upload failed:', uploadError)
              // Continue without image
            }
          }

          // Create section
          const sectionData = {
            title: section.title,
            content: section.content,
            questionType: section.questionType,
            imageUrl: imageUrl,
            questions: section.questions
          }

          const sectionResult = await testService.createListeningSection(
              sectionData,
              testResult.id,
              partIndex + 1,
              sectionIndex + 1
          )
          console.log('Section created with ID:', sectionResult.id)

          // Create questions
          for (let qIndex = 0; qIndex < section.questions.length; qIndex++) {
            const question = section.questions[qIndex]

            // Prepare options for multiple choice
            let options = null
            if (section.questionType === 'multiple_choice' && question.options?.length > 0) {
              options = question.options.map(option => ({
                id: option.id,
                text: option.text
              }))
            }

            // Prepare matching items and options
            let matchingItems = null
            let matchingOptions = null
            if (section.questionType === 'matching') {
              if (question.matchingItems?.length > 0) {
                matchingItems = question.matchingItems.map(item => ({
                  name: item.name,
                  matchedOption: item.matchedOption
                }))
              }
              if (question.matchingOptions?.length > 0) {
                matchingOptions = question.matchingOptions.map(option => ({
                  text: option.text,
                  selected: option.selected
                }))
              }
            }
            const questionData = {
              text: question.text, // ✅ ВАЖНО
              type: section.questionType,
              order_number: qIndex + 1
            }

            const createdQuestion = await testService.createListeningQuestion(
                questionData,
                sectionResult.id,
                qIndex + 1
            )

            // 2️⃣ сохраняем answers ТОЛЬКО для note_completion
            if (section.questionType === 'note_completion') {
              await testService.createListeningAnswers(
                  createdQuestion.id,
                  question.answers
              )
            }

            // await testService.createListeningQuestion(
            //     questionData,
            //     sectionResult.id,
            //     qIndex + 1
            // )
          }
        }
      }

    }
    else if (selectedTestType.value === 'reading') {
      console.log('=== Creating Reading Test ===')

      // 1️⃣ Create reading test
      const testResult = await testService.createReadingTest(testData, userId)
      console.log('Reading test created with ID:', testResult.id)
      result = testResult

      // 2️⃣ Create sections
      for (let partIndex = 0; partIndex < testParts.length; partIndex++) {
        const part = testParts[partIndex]

        for (let sectionIndex = 0; sectionIndex < part.sections.length; sectionIndex++) {
          const section = part.sections[sectionIndex]

          // Upload image if exists (опционально)
          let imageUrl = null
          if (section.imageFile) {
            try {
              imageUrl = await testService.uploadSectionImage(
                  section.imageFile,
                  testResult.id,
                  partIndex + 1,
                  sectionIndex + 1
              )
            } catch (e) {
              console.error('Image upload failed', e)
            }
          }

          // 3️⃣ Create section
          const sectionResult = await testService.createReadingSection(
              {
                title: section.title,
                content: section.content,
                questionType: section.questionType
              },
              testResult.id,
              sectionIndex + 1
          )

          console.log('Section created:', sectionResult.id)

          // 4️⃣ Create questions
          for (let qIndex = 0; qIndex < section.questions.length; qIndex++) {
            const question = section.questions[qIndex]

            // ⬅️ ВАЖНО: только данные вопроса
            const questionData = {
              text: question.text,
              type: section.questionType
            }

            const createdQuestion = await testService.createReadingQuestion(
                questionData,
                sectionResult.id,
                qIndex + 1
            )

            // 5️⃣ Save answers ONLY for note_completion
            if (section.questionType === 'note_completion') {
              await testService.createReadingAnswers(
                  createdQuestion.id,
                  question.answers
              )
            }
          }
        }
      }
    }


    else if (selectedTestType.value === 'writing') {
      console.log('=== Creating Writing Test ===')

      // Create writing test first (without image URLs initially)
      const testResult = await testService.createWritingTest(
          {
            ...testData,
            tasks: {
              task1: {
                title: writingTasks.task1.title,
                question: writingTasks.task1.question,
                minWords: writingTasks.task1.minWords,
                recommendedTime: writingTasks.task1.recommendedTime,
                imageUrl: null // Initialize as null
              },
              task2: {
                title: writingTasks.task2.title,
                question: writingTasks.task2.question,
                minWords: writingTasks.task2.minWords,
                recommendedTime: writingTasks.task2.recommendedTime,
                essayType: writingTasks.task2.essayType,
                imageUrl: null // Initialize as null
              }
            }
          },
          userId
      )

      console.log('Writing test created with ID:', testResult.id)
      result = testResult // CORRECTED THIS LINE

      // Upload and update Task 1 image
      if (writingTasks.task1.imageFile) {
        console.log('Uploading Task 1 image...')
        try {
          const task1ImageUrl = await testService.uploadWritingImage(
              writingTasks.task1.imageFile,
              testResult.id,
              1
          )
          console.log('Task 1 image uploaded. URL:', task1ImageUrl)

          // Update test with Task 1 image URL using service function
          await testService.updateWritingTestImage(testResult.id, 1, task1ImageUrl)
          console.log('Task 1 image URL updated in database')

        } catch (uploadError) {
          console.error('Task 1 image upload failed:', uploadError)
        }
      }

      // Upload and update Task 2 image
      if (writingTasks.task2.imageFile) {
        console.log('Uploading Task 2 image...')
        try {
          const task2ImageUrl = await testService.uploadWritingImage(
              writingTasks.task2.imageFile,
              testResult.id,
              2
          )
          console.log('Task 2 image uploaded. URL:', task2ImageUrl)

          // Update test with Task 2 image URL using service function
          await testService.updateWritingTestImage(testResult.id, 2, task2ImageUrl)
          console.log('Task 2 image URL updated in database')

        } catch (uploadError) {
          console.error('Task 2 image upload failed:', uploadError)
        }
      }

    }

    // Emit success event
    emit('saved', {
      type: selectedTestType.value,
      id: result.id,
      title: testTitle.value
    })

    // Show success message
    alert(`${selectedTestType.value.charAt(0).toUpperCase() + selectedTestType.value.slice(1)} test created successfully!`)

    // Reset form
    resetForm()

  } catch (err) {
    console.error('Error saving test:', err)
    console.error('Error stack:', err.stack)
    error.value = err.message || 'Failed to save test. Please try again.'

    // Show detailed error in alert for debugging
    alert(`Error: ${err.message}\n\nCheck console for details.`)
  } finally {
    loading.value = false
  }
  // Add this at the beginning of saveTest function
  console.log('=== Checking Storage Buckets ===')
  const { data: buckets } = await supabase.storage.listBuckets()
  console.log('Available buckets:', buckets?.map(b => b.name))
  console.log('=== End Bucket Check ===')
}

const resetForm = () => {
  selectedTestType.value = null
  testTitle.value = ''
  testDuration.value = 60
  writingDescription.value = ''
  audioFileName.value = ''
  audioFile.value = null
  loading.value = false
  error.value = ''

  // Clean up all image previews in test parts
  testParts.forEach(part => {
    part.sections.forEach(section => {
      if (section.imagePreview) {
        URL.revokeObjectURL(section.imagePreview)
      }
    })
  })

  // Reset test parts
  testParts.splice(0, testParts.length, {
    description: '',
    sections: [
      {
        title: '',
        content: '',
        imageFile: null,
        imagePreview: null,
        questionType: 'note_completion',
        questions: [{
          text: '',
          answer: [],
          options: [],
          correctOption: null,
          matchingItems: [],
          matchingOptions: []
        }]
      }
    ]
  })

  // Reset writing tasks
  if (writingTasks.task1.imagePreview) {
    URL.revokeObjectURL(writingTasks.task1.imagePreview)
  }
  if (writingTasks.task2.imagePreview) {
    URL.revokeObjectURL(writingTasks.task2.imagePreview)
  }

  writingTasks.task1 = {
    title: '',
    question: '',
    imageFile: null,
    imagePreview: null,
    minWords: 150,
    recommendedTime: 20,
    description: ''
  }

  writingTasks.task2 = {
    title: '',
    question: '',
    imageFile: null,
    imagePreview: null,
    minWords: 250,
    recommendedTime: 40,
    essayType: 'opinion',
    description: ''
  }

  step.value = 1
}
const addBlank = (question) => {
  if (!Array.isArray(question.answers)) {
    question.answers = []
  }
  question.answers.push('')
}
</script>

<style scoped>
/* Custom scrollbar */
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

/* Image preview styling */
img {
  object-fit: contain;
  max-width: 100%;
}
</style>