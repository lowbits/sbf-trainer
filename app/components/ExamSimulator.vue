<script setup lang="ts">
import CardHeader from "~/components/ui/cards/CardHeader.vue";
import {computed, ref} from "vue";
import {useTimer} from "~/composables/useTimer";

const props = defineProps<{
  exam: ExamSheet
}>()

const showExamPreview = ref<boolean>(false);

const timer = useTimer({immediate: false})

const isExamActive = ref<boolean>(false);

const currentQuestionIndex = ref<number>(0);

const currentQuestion = computed(() => {
  return props.exam?.questions[currentQuestionIndex.value] || null;
});

const progress = computed(() => {
  if (!props.exam) return 0;
  return ((currentQuestionIndex.value + 1) / props.exam.questions.length) * 100;
});

const examStats = computed(() => {
  if (!props.exam) return null;

  const basicQuestions = props.exam.questions.filter(q => q.originalQuestionNumber <= 72);
  const specificQuestions = props.exam.questions.filter(q => q.originalQuestionNumber > 72);

  return {
    total: props.exam.questions.length,
    basic: basicQuestions.length,
    specific: specificQuestions.length,
    timeLimit: props.exam.metadata.timeLimit,
    passingScore: props.exam.metadata.passingScore
  };
});

const timeStringToSeconds = (timeString: string): number => {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return (minutes * 60) + seconds;
};

const secondsToTimeString = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Calculate time left based on your timer
const timeLeft = computed(() => {
  if (!examStats.value || !isExamActive.value) return 0;

  const timeLimitSeconds = examStats.value.timeLimit * 60; // Convert minutes to seconds
  const elapsedSeconds = timeStringToSeconds(timer.elapsedTime.value);

  return Math.max(0, timeLimitSeconds - elapsedSeconds);
});

const formattedTimeLeft = computed(() => {
  return secondsToTimeString(timeLeft.value);
});

const isTimeRunningOut = computed(() => {
  return timeLeft.value <= 300; // Last 5 minutes
});


const startExam = (): void => {
  if (props.exam) {
    timer.reset()
    timer.resume()
    isExamActive.value = true
  }
};

const nextQuestion = () => {
  if (props.exam && currentQuestionIndex.value < props.exam.questions.length - 1) {
    currentQuestionIndex.value++;
  } else {
    endExam('completed');
  }
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

const goToQuestion = (index: number) => {
  if (index >= 0 && index < (props.exam?.questions.length || 0)) {
    currentQuestionIndex.value = index;
  }
};

const endExam = (reason: 'completed' | 'timeout' | 'manual') => {
  isExamActive.value = false;
  timer.pause();

  // Here you can emit an event or handle exam completion
  console.log(`Exam ended: ${reason}`);
  console.log(`Time elapsed: ${timer.elapsedTime}`);
  console.log(`Questions answered: ${currentQuestionIndex.value + 1}/${examStats.value?.total}`);
};

const previewExam = (): void => {
  showExamPreview.value = !showExamPreview.value;
};

watch(timeLeft, (newTimeLeft) => {
  if (newTimeLeft <= 0 && isExamActive.value) {
    endExam('timeout');
  }
});

</script>
<template>
  <div v-if="isExamActive" class="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm">
    <div class="h-full flex flex-col">
      <!-- Header with timer and controls -->
      <div class="bg-slate-800/90 border-b border-slate-700 px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <h2 class="text-xl font-semibold text-white">{{ exam.title }}</h2>
            <div class="flex items-center gap-4">
              <div class="text-sm text-slate-300">
                Frage {{ currentQuestionIndex + 1 }} von {{ examStats?.total }}
              </div>
              <div class="w-32 bg-slate-700 rounded-full h-2">
                <div
                    class="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${progress}%` }"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Timer -->
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-sm text-slate-400">Verbleibende Zeit</div>
                <div
                    class="text-lg font-mono font-bold"
                    :class="isTimeRunningOut ? 'text-red-400' : 'text-green-400'"
                >
                  {{ formattedTimeLeft }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-slate-400">Verstrichene Zeit</div>
                <div class="text-lg font-mono font-bold text-blue-400">
                  {{ timer.elapsedTime }}
                </div>
              </div>
            </div>

            <!-- Exit button -->
            <button
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                @click="endExam('manual')"
            >
              Prüfung beenden
            </button>
          </div>
        </div>
      </div>

      <!-- Question content -->
      <div class="flex-1 overflow-auto p-6">
        <div v-if="currentQuestion" class="max-w-4xl mx-auto">
          <!-- Question -->
          <div class="bg-slate-800/50 rounded-xl p-6 mb-6">
            <div class="flex items-start gap-4">
              <span
                  class="w-8 h-8 bg-purple-500 text-white rounded-lg text-sm font-bold flex items-center justify-center flex-shrink-0">
                {{ currentQuestionIndex + 1 }}
              </span>
              <div class="flex-1">
                <h3 class="text-lg text-white mb-4">{{ currentQuestion.question }}</h3>

                <!-- Question images if any -->
                <div v-if="currentQuestion.images?.length" class="mb-4">
                  <img
                      v-for="image in currentQuestion.images"
                      :key="image"
                      :src="image"
                      :alt="`Question ${currentQuestionIndex + 1} image`"
                      class="max-w-full h-auto rounded-lg"
                  >
                </div>

                <!-- Answer options -->
                <div class="space-y-3">
                  <label
                      v-for="(answer, index) in currentQuestion.answers"
                      :key="index"
                      class="flex items-start gap-3 p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                        type="radio"
                        :name="`question-${currentQuestion.id}`"
                        :value="index"
                        class="mt-1 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-800"
                    >
                    <span class="text-slate-200">{{ answer.text }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="bg-slate-800/90 border-t border-slate-700 px-2 md:px-6 py-4">
        <div class="flex items-center justify-between gap-2">
          <!-- Previous Button -->
          <button
              :disabled="currentQuestionIndex === 0"
              class="px-2 md:px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors flex-shrink-0"
              @click="previousQuestion"
          >
            <span class="md:hidden">←</span>
            <span class="hidden md:inline">← Vorherige</span>
          </button>

          <!-- Question Navigation - Different layouts for mobile/desktop -->
          <div class="flex-1 flex items-center justify-center">
            <!-- Mobile: Simplified navigation -->
            <div class="md:hidden flex items-center gap-2">
              <!-- Current question indicator -->
              <div class="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-1">
                <span class="text-slate-400 text-sm">Frage</span>
                <span class="text-white font-semibold">{{ currentQuestionIndex + 1 }}</span>
                <span class="text-slate-400 text-sm">von {{ exam.questions.length }}</span>
              </div>

              <!-- Quick jump dropdown or input -->
              <button
                  @click="showQuestionPicker = !showQuestionPicker"
                  class="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                ⋯
              </button>
            </div>

            <!-- Desktop: Show more question numbers with smart pagination -->
            <div class="hidden md:flex items-center gap-1">
              <!-- Show first few questions -->
              <template v-if="currentQuestionIndex <= 5">
                <button
                    v-for="index in Math.min(10, exam.questions.length)"
                    :key="index"
                    class="w-8 h-8 rounded text-sm font-medium transition-colors"
                    :class="[
                (index - 1) === currentQuestionIndex
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              ]"
                    @click="goToQuestion(index - 1)"
                >
                  {{ index }}
                </button>
              </template>

              <!-- Show middle range around current question -->
              <template v-else-if="currentQuestionIndex > 5 && currentQuestionIndex < exam.questions.length - 5">
                <button
                    class="w-8 h-8 rounded text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    @click="goToQuestion(0)"
                >
                  1
                </button>
                <span class="text-slate-400 px-1">...</span>

                <button
                    v-for="index in 7"
                    :key="currentQuestionIndex + index - 3"
                    class="w-8 h-8 rounded text-sm font-medium transition-colors"
                    :class="[
                (currentQuestionIndex + index - 4) === currentQuestionIndex
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              ]"
                    @click="goToQuestion(currentQuestionIndex + index - 4)"
                >
                  {{ currentQuestionIndex + index - 3 }}
                </button>

                <span class="text-slate-400 px-1">...</span>
                <button
                    class="w-8 h-8 rounded text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    @click="goToQuestion(exam.questions.length - 1)"
                >
                  {{ exam.questions.length }}
                </button>
              </template>

              <!-- Show last few questions -->
              <template v-else>
                <button
                    class="w-8 h-8 rounded text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    @click="goToQuestion(0)"
                >
                  1
                </button>
                <span class="text-slate-400 px-1">...</span>

                <button
                    v-for="index in 10"
                    :key="exam.questions.length - 10 + index"
                    class="w-8 h-8 rounded text-sm font-medium transition-colors"
                    :class="[
                (exam.questions.length - 10 + index - 1) === currentQuestionIndex
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              ]"
                    @click="goToQuestion(exam.questions.length - 10 + index - 1)"
                >
                  {{ exam.questions.length - 10 + index }}
                </button>
              </template>
            </div>
          </div>

          <!-- Next Button -->
          <button
              class="px-2 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex-shrink-0"
              @click="nextQuestion"
          >
      <span class="md:hidden">
        {{ currentQuestionIndex === (examStats?.total || 0) - 1 ? '✓' : '→' }}
      </span>
            <span class="hidden md:inline">
        {{ currentQuestionIndex === (examStats?.total || 0) - 1 ? 'Prüfung abschließen' : 'Nächste →' }}
      </span>
          </button>
        </div>

        <!-- Mobile Question Picker Dropdown -->
        <div v-if="showQuestionPicker" class="md:hidden mt-4 bg-slate-700/50 rounded-lg p-4">
          <div class="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
            <button
                v-for="(question, index) in exam.questions"
                :key="question.id"
                class="w-10 h-10 rounded text-sm font-medium transition-colors"
                :class="[
            index === currentQuestionIndex
              ? 'bg-purple-500 text-white'
              : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
          ]"
                @click="goToQuestion(index); showQuestionPicker = false"
            >
              {{ index + 1 }}
            </button>
          </div>
          <button
              @click="showQuestionPicker = false"
              class="mt-3 w-full py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  </div>
  <CollapsibleCard class="mt-8" variant="purple" padding="narrow">
    <template #trigger>
      <CardHeader
          variant="purple"
          :title="exam.title"
          :subtitle="`${examStats?.total} Fragen • ${examStats?.timeLimit} Minuten`"
      >
        <template #icon>
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </template>
      </CardHeader>
    </template>

    <div class="py-6 space-y-6">
      <!-- ExamSimulator Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-slate-700/30 rounded-lg">
          <div class="text-2xl font-bold text-purple-400">{{ examStats?.total }}</div>
          <div class="text-xs text-slate-400">Fragen</div>
        </div>
        <div class="text-center p-4 bg-slate-700/30 rounded-lg">
          <div class="text-2xl font-bold text-purple-400">{{ examStats?.basic }}</div>
          <div class="text-xs text-slate-400">Basis</div>
        </div>
        <div class="text-center p-4 bg-slate-700/30 rounded-lg">
          <div class="text-2xl font-bold text-purple-400">{{ examStats?.specific }}</div>
          <div class="text-xs text-slate-400">Spezifisch</div>
        </div>
        <div class="text-center p-4 bg-slate-700/30 rounded-lg">
          <div class="text-2xl font-bold text-purple-400">{{ examStats?.timeLimit }}</div>
          <div class="text-xs text-slate-400">Minuten</div>
        </div>
      </div>

      <!-- ExamSimulator Description -->
      <div class="p-4 bg-slate-700/20 rounded-lg">
        <p class="text-slate-300 text-sm">{{ exam.description }}</p>
      </div>

      <!-- Passing Requirements -->
      <div class="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <h4 class="font-semibold text-purple-300 mb-3">Bestehensvoraussetzungen</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-400">Basisfragen:</span>
            <span class="text-purple-300 font-medium">{{ examStats?.passingScore.basic }}/{{
                examStats?.basic
              }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Spezifische:</span>
            <span class="text-purple-300 font-medium">{{
                examStats?.passingScore.specific
              }}/{{ examStats?.specific }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Gesamt:</span>
            <span class="text-purple-300 font-medium">{{ examStats?.passingScore.total }}/{{
                examStats?.total
              }}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button
            class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
            @click="startExam">
          Prüfung starten
        </button>
        <button
            class="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-slate-300 rounded-xl font-medium transition-all duration-300"
            @click="previewExam">
          {{ showExamPreview ? 'Vorschau ausblenden' : 'Fragen-Vorschau' }}
        </button>
      </div>

      <!-- ExamSimulator Preview -->
      <div v-if="showExamPreview" class="border-t border-slate-700/50 pt-6">
        <h4 class="font-semibold text-slate-200 mb-4">Fragen-Überblick</h4>
        <div class="space-y-3 max-h-64 overflow-y-auto">
          <div
              v-for="(question, index) in exam.questions.slice(0, 5)"
              :key="question.id"
              class="p-3 bg-slate-700/20 rounded-lg">
            <div class="flex items-start gap-3">
                    <span
                        class="w-6 h-6 bg-purple-500/20 text-purple-300 rounded text-xs font-medium flex items-center justify-center flex-shrink-0">
                      {{ index + 1 }}
                    </span>
              <div class="flex-1 min-w-0">
                <p class="text-slate-300 text-sm line-clamp-2">{{ question.question }}</p>
                <div class="flex items-center gap-2 mt-2">
                        <span class="px-2 py-1 text-xs bg-slate-600/50 text-slate-400 rounded">
                          {{ question.originalQuestionNumber <= 72 ? 'Basis' : 'Spezifisch' }}
                        </span>
                  <span
                      v-if="question.images?.length"
                      class="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded">
                          📸 Mit Bild
                        </span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="exam.questions.length > 5" class="text-center text-slate-400 text-sm">
            ... und {{ exam.questions.length - 5 }} weitere Fragen
          </div>
        </div>
      </div>
    </div>
  </CollapsibleCard>
</template>
