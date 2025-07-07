<script setup lang="ts">
interface ExamResults {
  correctBasic: number;
  correctSpecific: number;
  totalCorrect: number;
  totalQuestions: number;
  basicQuestions: number;
  specificQuestions: number;
  passed: boolean;
  answeredQuestions: number;
}

interface PassingScore {
  basic: number;
  specific: number;
  total: number;
}

interface Props {
  show: boolean;
  results: ExamResults;
  passingScore: PassingScore;
  timeElapsed: string;
}

const props = defineProps<Props>();

defineEmits<{
  close: [];
  newExam: [];
  retryExam: [];
  reviewAnswers: [];
}>();

const accuracy = computed(() => {
  if (props.results.answeredQuestions === 0) return 0;
  return Math.round((props.results.totalCorrect / props.results.answeredQuestions) * 100);
});
</script>
<template>
  <Transition name="modal" appear>
    <div
        v-if="show"
        class="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Transition name="modal-content" appear>
        <div class="bg-slate-800 rounded-2xl p-4 md:p-8 max-w-lg w-full border border-slate-700 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
          <div class="text-center">
            <!-- Success/Fail Icon -->
            <div
                class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                :class="results.passed ? 'bg-emerald-500/20' : 'bg-red-500/20'"
            >
              <svg
                  v-if="results.passed"
                  class="w-8 h-8 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                  v-else
                  class="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <!-- Title and Message -->
            <h2 class="text-2xl font-bold text-white mb-2">
              {{ results.passed ? 'Prüfung bestanden! 🎉' : 'Prüfung nicht bestanden 😔' }}
            </h2>
            <p class="text-slate-400 mb-6">
              {{
                results.passed
                    ? 'Herzlichen Glückwunsch, zukünftiger Kapitän!'
                    : 'Nicht aufgeben - beim nächsten Mal schaffst du es!'
              }}
            </p>

            <!-- Results Overview -->
            <div
                class="rounded-lg p-4 mb-6 border"
                :class="results.passed
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'"
            >
              <div class="grid grid-cols-2 gap-4 text-sm">
                <!-- Basic Questions -->
                <div class="text-center">
                  <div class="text-slate-400 mb-1">Basisfragen</div>
                  <div
                      class="text-lg font-bold"
                      :class="results.correctBasic >= passingScore.basic ? 'text-emerald-400' : 'text-red-400'"
                  >
                    {{ results.correctBasic }}/{{ results.basicQuestions }}
                  </div>
                  <div class="text-xs text-slate-500">
                    ({{ passingScore.basic }} benötigt)
                  </div>
                </div>

                <!-- Specific Questions -->
                <div class="text-center">
                  <div class="text-slate-400 mb-1">Spezifische</div>
                  <div
                      class="text-lg font-bold"
                      :class="results.correctSpecific >= passingScore.specific ? 'text-emerald-400' : 'text-red-400'"
                  >
                    {{ results.correctSpecific }}/{{ results.specificQuestions }}
                  </div>
                  <div class="text-xs text-slate-500">
                    ({{ passingScore.specific }} benötigt)
                  </div>
                </div>
              </div>
            </div>

            <!-- Detailed Stats -->
            <div class="bg-slate-700/50 rounded-lg p-4 mb-6 space-y-2">
              <div class="flex justify-between">
                <span class="text-slate-300">Richtige Antworten:</span>
                <span class="text-emerald-400 font-bold">{{ results.totalCorrect }}/{{ results.totalQuestions }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-300">Falsche Antworten:</span>
                <span class="text-red-400 font-bold">{{ results.totalQuestions - results.totalCorrect }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-300">Beantwortet:</span>
                <span class="text-blue-400 font-bold">{{ results.answeredQuestions }}/{{
                    results.totalQuestions
                  }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-300">Genauigkeit:</span>
                <span class="text-orange-400 font-bold">{{ accuracy }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-300">Zeit:</span>
                <span class="text-purple-400 font-bold tabular-nums">{{ timeElapsed }}</span>
              </div>
            </div>

            <!-- Requirements Status -->
            <div class="bg-slate-700/30 rounded-lg p-3 mb-6 text-xs">
              <h4 class="text-slate-300 font-medium mb-2">Bestehensvoraussetzungen:</h4>
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span>Basis: {{ passingScore.basic }}/{{ results.basicQuestions }}</span>
                  <span :class="results.correctBasic >= passingScore.basic ? 'text-emerald-400' : 'text-red-400'">
                    {{ results.correctBasic >= passingScore.basic ? '✓' : '✗' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Spezifisch: {{ passingScore.specific }}/{{ results.specificQuestions }}</span>
                  <span :class="results.correctSpecific >= passingScore.specific ? 'text-emerald-400' : 'text-red-400'">
                    {{ results.correctSpecific >= passingScore.specific ? '✓' : '✗' }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Gesamt: {{ passingScore.total }}/{{ results.totalQuestions }}</span>
                  <span :class="results.totalCorrect >= passingScore.total ? 'text-emerald-400' : 'text-red-400'">
                    {{ results.totalCorrect >= passingScore.total ? '✓' : '✗' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button
                  v-if="results.passed"
                  class="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                  @click="$emit('newExam')"
              >
                Neue Prüfung starten
              </button>
              <button
                  v-else
                  class="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                  @click="$emit('retryExam')"
              >
                Prüfung wiederholen
              </button>

              <button
                  class="w-full px-4 py-2 bg-slate-600 text-slate-300 rounded-lg hover:bg-slate-500 transition-colors"
                  @click="$emit('reviewAnswers')"
              >
                Antworten durchgehen
              </button>

              <button
                  class="w-full px-4 py-2 bg-slate-700 text-slate-400 rounded-lg hover:bg-slate-600 transition-colors"
                  @click="$emit('close')"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>


<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}
</style>
