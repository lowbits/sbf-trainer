<template>
  <Transition name="slide-up" appear>
    <div v-if="show" class="bg-slate-700/50 rounded-lg p-4">
      <!-- Header with stats (only in review mode) -->
      <div v-if="mode === 'review'" class="flex items-center justify-between mb-4">
        <h3 class="text-white font-medium">Fragen-Übersicht</h3>
        <div class="flex items-center gap-4 text-xs">
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-emerald-500 rounded-full"/>
            <span class="text-emerald-400">{{ stats.correct }} richtig</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-red-500 rounded-full"/>
            <span class="text-red-400">{{ stats.wrong }} falsch</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-slate-500 rounded-full"/>
            <span class="text-slate-400">{{ stats.unanswered }} offen</span>
          </div>
        </div>
      </div>

      <!-- Filter buttons (only in review mode) -->
      <div v-if="mode === 'review'" class="flex gap-2 mb-4">
        <button
            v-for="filter in filterOptions"
            :key="filter.key"
            class="px-3 py-1 rounded text-xs font-medium transition-colors"
            :class="currentFilter === filter.key
          ? `bg-${filter.color}-500 text-white`
          : 'bg-slate-600 text-slate-300 hover:bg-slate-500'"
            @click="updateFilter(filter.key)"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Questions grid -->
      <div class="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
        <button
            v-for="(question, index) in displayQuestions"
            :key="question.id"
            class="relative w-10 h-10 rounded text-sm font-medium transition-colors"
            :class="getQuestionButtonClass(question, index)"
            @click="handleQuestionClick(question, index)"
        >
          {{ getQuestionNumber(question, index) }}

          <!-- Status indicator (review mode only) -->
          <div
              v-if="mode === 'review'"
              class="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              :class="getStatusIndicatorClass(question)"
          >
            <!-- Correct icon -->
            <svg
                v-if="getQuestionStatus(question) === 'correct'"
                class="w-2.5 h-2.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>

            <!-- Wrong icon -->
            <svg
                v-else-if="getQuestionStatus(question) === 'wrong'"
                class="w-2.5 h-2.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
            </svg>

            <!-- Unanswered indicator -->
            <div
                v-else-if="getQuestionStatus(question) === 'unanswered'"
                class="w-1.5 h-1.5 bg-white rounded-full"
            />
          </div>
        </button>
      </div>

      <!-- No results message (review mode only) -->
      <div v-if="mode === 'review' && displayQuestions.length === 0" class="text-center py-4">
        <p class="text-slate-400 text-sm">{{ getNoResultsMessage() }}</p>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-2 mt-4">
        <button
            class="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
            @click="$emit('close')"
        >
          Schließen
        </button>
        <button
            v-if="mode === 'review' && stats.wrong > 0"
            class="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            @click="goToFirstWrong"
        >
          Erste falsche Frage
        </button>
      </div>
    </div>
</transition></template>

<script setup lang="ts">
interface Question {
  id: string;
  originalIndex?: number;
}

interface QuestionStats {
  correct: number;
  wrong: number;
  unanswered: number;
}

interface Props {
  show: boolean;
  questions: Question[];
  currentQuestionIndex: number;
  mode: 'exam' | 'review';
  userAnswers?: Map<string, string>;
  filter?: string;
  stats?: QuestionStats;
}

const props = withDefaults(defineProps<Props>(), {
  filter: 'all',
  stats: () => ({ correct: 0, wrong: 0, unanswered: 0 })
});

const emit = defineEmits<{
  close: [];
  goToQuestion: [index: number];
  updateFilter: [filter: string];
}>();

const currentFilter = ref(props.filter);

const filterOptions = [
  { key: 'all', label: 'Alle', color: 'purple' },
  { key: 'correct', label: 'Richtig', color: 'emerald' },
  { key: 'wrong', label: 'Falsch', color: 'red' },
  { key: 'unanswered', label: 'Offen', color: 'slate' }
];

// Get question status for review mode
const getQuestionStatus = (question: Question): 'correct' | 'wrong' | 'unanswered' => {
  if (props.mode !== 'review' || !props.userAnswers) return 'unanswered';

  const userAnswer = props.userAnswers.get(question.id);
  if (!userAnswer) return 'unanswered';

  // You'll need to pass the correct answer or get it from the question object
  // Assuming the question has a correctAnswer property
  const correctAnswer = (question as any).correctAnswer;
  return userAnswer === correctAnswer ? 'correct' : 'wrong';
};

// Filter questions based on current filter (review mode only)
const displayQuestions = computed(() => {
  if (props.mode === 'exam') {
    return props.questions.map((q, index) => ({ ...q, originalIndex: index }));
  }

  if (currentFilter.value === 'all') {
    return props.questions.map((q, index) => ({ ...q, originalIndex: index }));
  }

  return props.questions
      .map((q, index) => ({ ...q, originalIndex: index }))
      .filter(q => getQuestionStatus(q) === currentFilter.value);
});

// Get button styling based on mode and question status
const getQuestionButtonClass = (question: Question, index: number) => {
  const isCurrentQuestion = props.mode === 'exam'
      ? index === props.currentQuestionIndex
      : (question.originalIndex ?? index) === props.currentQuestionIndex;

  if (isCurrentQuestion) {
    return 'bg-purple-500 text-white';
  }

  if (props.mode === 'exam') {
    return 'bg-slate-600 hover:bg-slate-500 text-slate-200';
  }

  // Review mode styling
  const status = getQuestionStatus(question);
  switch (status) {
    case 'correct':
      return 'bg-emerald-600 hover:bg-emerald-500 text-white';
    case 'wrong':
      return 'bg-red-600 hover:bg-red-500 text-white';
    case 'unanswered':
      return 'bg-slate-600 hover:bg-slate-500 text-slate-200';
    default:
      return 'bg-slate-600 hover:bg-slate-500 text-slate-200';
  }
};

// Get status indicator styling
const getStatusIndicatorClass = (question: Question) => {
  const status = getQuestionStatus(question);

  switch (status) {
    case 'correct':
      return 'bg-emerald-500';
    case 'wrong':
      return 'bg-red-500';
    case 'unanswered':
      return 'bg-slate-500';
    default:
      return 'bg-slate-500';
  }
};

// Get question number to display
const getQuestionNumber = (question: Question, index: number) => {
  return props.mode === 'exam'
      ? index + 1
      : (question.originalIndex ?? index) + 1;
};

// Get no results message
const getNoResultsMessage = () => {
  switch (currentFilter.value) {
    case 'correct':
      return 'Keine richtigen Antworten gefunden.';
    case 'wrong':
      return 'Keine falschen Antworten gefunden.';
    case 'unanswered':
      return 'Alle Fragen wurden beantwortet.';
    default:
      return 'Keine Fragen gefunden.';
  }
};

// Handle question click
const handleQuestionClick = (question: Question, index: number) => {
  const targetIndex = props.mode === 'exam' ? index : (question.originalIndex ?? index);
  emit('goToQuestion', targetIndex);
  emit('close');
};

// Update filter
const updateFilter = (filter: string) => {
  currentFilter.value = filter;
  emit('updateFilter', filter);
};

// Go to first wrong answer
const goToFirstWrong = () => {
  const firstWrong = props.questions.findIndex(q => getQuestionStatus(q) === 'wrong');
  if (firstWrong !== -1) {
    const question = props.questions[firstWrong];
    const targetIndex = question?.originalIndex ?? firstWrong;
    emit('goToQuestion', targetIndex);
    emit('close');
  }
};

// Watch for external filter changes
watch(() => props.filter, (newFilter) => {
  currentFilter.value = newFilter;
});
</script>

<style scoped>
/* Slide up from bottom / slide down animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: bottom;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scaleY(0.8);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scaleY(0.9);
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0) scaleY(1);
}

/* Slightly longer enter animation for smoothness */
.slide-up-enter-active {
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>
