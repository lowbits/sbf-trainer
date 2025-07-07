<template>
  <button
      :class="buttonClasses"
      :disabled="disabled || showExplanation"
      @click="handleClick"
      style="-webkit-tap-highlight-color: transparent;"
  >
    <span class="flex items-center gap-3">
      <!-- Answer letter/number badge -->
      <span
          class="w-8 h-8 shrink-0 bg-gradient-to-r rounded-lg flex items-center justify-center font-bold text-sm"
          :class="badgeClasses">
        {{ answerLabel }}

        <!-- Correct answer icon -->
        <span
            v-if="showExplanation && isCorrect"
            class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"
        >
          <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
          </svg>
        </span>

        <!-- Wrong answer icon -->
        <span
            v-if="showExplanation && isSelected && !isCorrect"
            class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
        >
          <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </span>
      </span>

      <!-- Answer text -->
      <span class="text-sm leading-relaxed text-left flex-1" :class="textClasses">
        {{ answer.text }}
      </span>
    </span>

    <!-- Hover overlay (only when no explanation) -->
    <span
        v-if="!showExplanation"
        class="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-teal-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    />
  </button>
</template>

<script setup lang="ts">
interface Answer {
  id: string | number;
  text: string;
}

interface Props {
  answer: Answer;
  index: number;
  isSelected?: boolean;
  isCorrect?: boolean;
  showExplanation?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'compact';
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isCorrect: false,
  showExplanation: false,
  disabled: false,
  variant: 'default'
});

const emit = defineEmits<{
  select: [answerId: string | number];
}>();

// Generate answer label (A, B, C, D or 1, 2, 3, 4)
const answerLabel = computed(() => {
  return String.fromCharCode(65 + props.index); // A, B, C, D
  // Alternative: return (props.index + 1).toString(); // 1, 2, 3, 4
});

// Button classes
const buttonClasses = computed(() => {
  const base = [
    'group relative text-left rounded-xl transition-colors duration-300 touch-manipulation',
    props.variant === 'compact' ? 'p-2' : 'p-2.5 md:p-5'
  ];

  if (!props.showExplanation) {
    // Normal interactive state
    base.push('bg-slate-700/50 hover:bg-teal-500/20 border border-slate-600/50 hover:border-teal-500/50 hover:shadow-lg');

    if (props.isSelected) {
      base.push('bg-teal-500/20 border-teal-500/50');
    }
  } else {
    // Explanation state
    if (props.isCorrect) {
      base.push('bg-emerald-500/20 border border-emerald-500/50 shadow-lg shadow-emerald-500/20');
    } else if (props.isSelected) {
      base.push('bg-red-500/20 border border-red-500/50 shadow-lg shadow-red-500/20');
    } else {
      base.push('bg-slate-700/30 border border-slate-600/30 opacity-70');
    }
  }

  return base;
});

// Badge classes
const badgeClasses = computed(() => {
  if (!props.showExplanation) {
    // Normal state
    if (props.isSelected) {
      return 'from-teal-500 to-teal-600 text-white';
    }
    return 'from-slate-600 to-slate-700 text-slate-300 group-hover:from-teal-500 group-hover:to-teal-600 group-hover:text-white';
  } else {
    // Explanation state
    if (props.isCorrect) {
      return 'from-emerald-500 to-emerald-600 text-white';
    } else if (props.isSelected) {
      return 'from-red-500 to-red-600 text-white';
    } else {
      return 'from-slate-600 to-slate-700 text-slate-400';
    }
  }
});

// Text classes
const textClasses = computed(() => {
  if (!props.showExplanation) {
    return 'text-slate-200';
  } else {
    if (props.isCorrect) {
      return 'text-emerald-100 font-medium';
    } else if (props.isSelected) {
      return 'text-red-100';
    } else {
      return 'text-slate-400';
    }
  }
});

const handleClick = () => {
  if (!props.disabled && !props.showExplanation) {
    emit('select', props.answer.id);
  }
};
</script>
