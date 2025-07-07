<script setup lang="ts">
import {$fetch} from "ofetch";
import {reactive, ref} from 'vue';
import type {Question} from "~~/server/assets/data/questions";
import Card from "~/components/ui/cards/Card.vue";
import CardHeader from "~/components/ui/cards/CardHeader.vue";
import AudioPlayer from "~/components/AudioPlayers/AudioPlayer.vue";
import ExamSimulator from "~/components/ExamSimulator.vue";
import QuestionContent from "~/components/quiz/QuestionContent.vue";
import Logo from "~/components/logos/Logo.vue";

// Types
interface User {
  name: string;
  subscription: {
    isPro: boolean;
  };
}

interface PodcastScript {
  title: string;
  dailyIntro: string;
  todaysTopics: string;
  mainContent: Array<{
    section: string;
    content: string;
    questions: string[];
  }>;
  quickTips: string[];
  knotOfTheDay: string;
  conclusion: string;
  estimatedDuration: string;
  date: string;
  questionsUsed: string[];
  metadata: {
    generatedAt: string;
    questionsCount: number;
    categories: string[];
  };
}

interface PodcastData {
  audioUrl: string;
  script: PodcastScript;
  cached: boolean;
}


interface PodcastResponse {
  success: boolean;
  podcast: PodcastData;
  questions: Question[];
  knot?: Knot;
  exam?: ExamSheet; // NEW: Include exam in response
}


// Mock user data
const user = reactive<User>({
  name: 'Test user',
  subscription: {isPro: true}
});

// Reactive data
const generating = ref<boolean>(false);
const error = ref<string | null>(null);
const todaysPodcast = ref<PodcastData | null>(null);
const showScript = ref<boolean>(false);

// Podcast questions data
const podcastQuestions = ref<Question[]>([]);
const selectedAnswers = ref<Record<string, string>>({});
const questionAnswers = ref<Record<string, boolean>>({});

const podcastKnot = ref<Knot>();
const todaysExam = ref<ExamSheet | undefined>();

// Utility methods
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};


// API methods
const generatePodcast = async (): Promise<void> => {
  generating.value = true;
  error.value = null;

  try {
    const result = await $fetch<PodcastResponse>('/api/podcast/generate', {
      method: 'POST'
    });

    todaysPodcast.value = result.podcast;
    podcastQuestions.value = result.questions;
    podcastKnot.value = result.knot

    console.log(result);

    // NEW: Handle exam data
    if (result.exam) {
      todaysExam.value = result.exam;
    }

    // Reset question states
    selectedAnswers.value = {};
    questionAnswers.value = {};

  } catch (err: any) {
    console.error(err);
    error.value = err.data?.message || 'Fehler beim Generieren des Podcasts';
  } finally {
    generating.value = false;
  }
};


const {pending: loadingToday, data: todayData} = await useLazyFetch<PodcastResponse>('/api/podcast/today');

watch(todayData, (newData) => {
  if (newData) {
    todaysPodcast.value = newData.podcast;
    podcastQuestions.value = newData.questions;
    podcastKnot.value = newData.knot;
    todaysExam.value = newData.exam;

    // Reset question states
    selectedAnswers.value = {};
    questionAnswers.value = {};
  }
}, {immediate: true});


// Question interaction methods
const selectQuestionAnswer = (questionId: string, answerId: string): void => {
  if (questionAnswers.value[questionId]) return; // Already answered

  selectedAnswers.value[questionId] = answerId;
  questionAnswers.value[questionId] = true;
};

// Navigation methods
const upgradeToPro = (): void => {
  navigateTo('/pricing');
};

</script>

<template>
  <div>
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden">
      <div
          class="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float"/>
      <div
          class="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float"
          style="animation-delay: 2s;"/>
      <div
          class="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-xl animate-float"
          style="animation-delay: 4s;"/>
    </div>

    <!-- Floating Elements -->
    <div class="absolute top-16 left-16 w-2 h-2 bg-teal-400 rounded-full animate-pulse"/>
    <div class="absolute top-40 right-32 w-1 h-1 bg-teal-400 rounded-full animate-ping"/>
    <div
        class="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"
        style="animation-delay: 1s;"/>

    <div class="relative z-10 min-h-screen p-4">
      <div class="w-full max-w-4xl mx-auto animate-fade-in">

        <!-- Header -->
        <div class="text-center">
          <Logo/>
          <p class="text-slate-400 text-lg mb-2">Täglicher Prüfungsbegleiter</p>
          <p class="text-slate-500 text-sm">{{ formatDate(new Date()) }}</p>
        </div>

        <!-- Pro Feature Banner -->
        <div v-if="!user?.subscription?.isPro" class="mt-8 relative">
          <!-- Glow Effect -->
          <div
              class="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur opacity-30 animate-pulse"/>
          <div class="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div
                    class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.536 11.293l-1.414 1.414a8 8 0 01-11.313 0l6.364-6.364a8 8 0 0111.313 11.313l-1.414-1.414"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-white">Täglicher Nautischer Podcast</h3>
                  <p class="text-slate-300">Täglich 2-3 Minuten geballtes Prüfungswissen für unterwegs</p>
                </div>
              </div>
              <button
                  class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                  @click="upgradeToPro">
                Pro werden
              </button>
            </div>
          </div>
        </div>


        <!-- Loading State -->
        <div v-if="loadingToday || generating" class="mt-8 relative">
          <div
              class="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl blur opacity-30 animate-pulse"/>
          <div class="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div class="text-center">
              <!-- Animated Waves -->
              <div class="relative w-24 h-24 mx-auto mb-6">
                <!-- Boat -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <svg class="w-12 h-12 text-teal-400 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-3H6v3zm.5-5L12 10l5.5 4H6.5zM12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                  </svg>
                </div>

                <!-- Animated Waves -->
                <div class="absolute bottom-0 left-0 w-full overflow-hidden">
                  <svg class="w-full h-8" viewBox="0 0 400 60" preserveAspectRatio="none">
                    <path class="fill-teal-400/30 animate-wave" d="M0,20 Q100,5 200,20 T400,20 L400,60 L0,60 Z">
                      <animate
                          attributeName="d" dur="3s" repeatCount="indefinite"
                          values="M0,20 Q100,5 200,20 T400,20 L400,60 L0,60 Z;
                                M0,30 Q100,15 200,30 T400,30 L400,60 L0,60 Z;
                                M0,20 Q100,5 200,20 T400,20 L400,60 L0,60 Z"/>
                    </path>
                    <path
                        class="fill-teal-500/20 animate-wave" d="M0,30 Q100,15 200,30 T400,30 L400,60 L0,60 Z"
                        style="animation-delay: -1s;">
                      <animate
                          attributeName="d" dur="3s" repeatCount="indefinite"
                          values="M0,30 Q100,15 200,30 T400,30 L400,60 L0,60 Z;
                                M0,40 Q100,25 200,40 T400,40 L400,60 L0,60 Z;
                                M0,30 Q100,15 200,30 T400,30 L400,60 L0,60 Z"/>
                    </path>
                    <path
                        class="fill-teal-600/15 animate-wave" d="M0,40 Q100,25 200,40 T400,40 L400,60 L0,60 Z"
                        style="animation-delay: -2s;">
                      <animate
                          attributeName="d" dur="3s" repeatCount="indefinite"
                          values="M0,40 Q100,25 200,40 T400,40 L400,60 L0,60 Z;
                                M0,35 Q100,20 200,35 T400,35 L400,60 L0,60 Z;
                                M0,40 Q100,25 200,40 T400,40 L400,60 L0,60 Z"/>
                    </path>
                  </svg>
                </div>
              </div>

              <p class="text-slate-400 text-lg mb-2">Dein Podcast segelt zu dir...</p>
              <p class="text-slate-500 text-sm">Das dauert nur einen Moment</p>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="mt-8 relative">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl blur opacity-30"/>
          <div class="relative bg-slate-800/80 backdrop-blur-xl border border-red-500/50 rounded-2xl p-6 shadow-2xl">
            <div class="flex items-center space-x-3 text-red-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-lg">{{ error }}</span>
            </div>
            <button
                class="mt-4 px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
                @click="generatePodcast">
              Erneut versuchen
            </button>
          </div>
        </div>

        <CollapsibleCard v-else-if="todaysPodcast " class="mt-8" default-open>
          <template #trigger>
            <CardHeader
                variant="teal"
                :title=" todaysPodcast.script.title"
                :subtitle="`Dauer: ${ todaysPodcast.script.estimatedDuration }`"
            >
              <template #icon>
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                </svg>
              </template>
            </CardHeader>

          </template>

          <AudioPlayer :audio="todaysPodcast.audioUrl"/>

          <div class="border-t border-slate-700/50 pt-6">
            <button
                class="flex items-center space-x-2 text-teal-400 hover:text-teal-300 transition-colors"
                @click="showScript = !showScript"
            >
              <svg
                  :class="['w-4 h-4 transition-transform', { 'rotate-180': showScript }]"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
              <span>{{ showScript ? 'Skript ausblenden' : 'Skript anzeigen' }}</span>
            </button>

            <div v-if="showScript" class="mt-4 space-y-4 text-sm">
              <div
                  v-for="section in todaysPodcast.script.mainContent" :key="section.section"
                  class="p-4 bg-slate-700/30 rounded-lg">
                <h4 class="font-semibold text-teal-300 mb-2">{{ section.section }}</h4>
                <p class="text-slate-300 leading-relaxed">{{ section.content }}</p>
              </div>

              <div
                  v-if="todaysPodcast.script.knotOfTheDay"
                  class="p-4 bg-slate-700/30 rounded-lg">
                <h4 class="font-semibold text-teal-300 mb-2">Heutiger Knoten</h4>
                <p class="text-slate-300 leading-relaxed">{{ todaysPodcast.script.knotOfTheDay }}</p>
              </div>

              <div v-if="todaysPodcast.script.quickTips.length" class="p-4 bg-slate-700/30 rounded-lg">
                <h4 class="font-semibold text-teal-300 mb-2">Praktische Hinweise</h4>
                <ul class="space-y-2">
                  <li v-for="tip in todaysPodcast.script.quickTips" :key="tip" class="flex items-start space-x-2">
                    <svg
                        class="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="text-slate-300">{{ tip }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CollapsibleCard>


        <!-- Generate Button -->
        <div v-else-if="user?.subscription?.isPro" class="mt-8 relative">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl blur opacity-30"/>
          <div
              class="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl text-center">
            <div class="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15.536 11.293l-1.414 1.414a8 8 0 01-11.313 0l6.364-6.364a8 8 0 0111.313 11.313l-1.414-1.414"/>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Noch kein Podcast für heute</h3>
            <p class="text-slate-400 mb-6">Generiere deinen täglichen nautischen Prüfungsbegleiter</p>
            <button
                :disabled="generating"
                class="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                @click="generatePodcast"
            >
              <span v-if="generating" class="flex items-center space-x-2">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                <span>Wird generiert...</span>
              </span>
              <span v-else>Podcast generieren</span>
            </button>
          </div>
        </div>

        <!-- Podcast Questions Section -->

        <CollapsibleCard v-if="podcastQuestions && podcastQuestions.length" class="mt-8" padding="narrow">

          <template #trigger>
            <CardHeader
                variant="blue"
                title="Fragen aus dieser Episode"
            >
              <template #icon>
                <svg
                    class="w-8 h-8 text-white transform group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M12 2C8 4 4 8 2 12c2 4 6 8 10 10 4-2 8-6 10-10-2-4-6-8-10-10z"
                      class="animate-pulse"
                  />
                  <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 8c2-2 6-2 8 0s2 6 0 8-6 2-8 0-2-6 0-8z"
                  />
                  <circle cx="12" cy="12" r="2" stroke-width="2"/>
                </svg>
              </template>
            </CardHeader>
          </template>

          <div class="space-y-6">
            <Card
                v-for="(question) in podcastQuestions"
                :key="question.id"
                variant="blue"
                padding="narrow"
            >
              <QuestionContent
                  :wrap="false"
                  :question="question" show-category mode="training"
                  :selected="selectedAnswers[question.id]"
                  :show-explanation="questionAnswers[question.id]"
                  @click:answer="(answerId) => selectQuestionAnswer(question.id, answerId)"/>
            </Card>
          </div>
        </CollapsibleCard>

        <CollapsibleCard v-if="podcastKnot" class="mt-8" variant="orange">
          <template #trigger>
            <CardHeader
                variant="orange"
                title="Knoten des Tages"
                :subtitle="podcastKnot.name"
            >
              <template #icon>
                <svg
                    class="w-8 h-8 text-white transform group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M12 2C8 4 4 8 2 12c2 4 6 8 10 10 4-2 8-6 10-10-2-4-6-8-10-10z"
                  />
                  <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 8c2-2 6-2 8 0s2 6 0 8-6 2-8 0-2-6 0-8z"
                  />
                  <circle cx="12" cy="12" r="2" stroke-width="2"/>
                </svg>
              </template>
            </CardHeader>
          </template>

          <!-- Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- Left Column: Info -->
            <div class="space-y-6">
              <!-- Knot Image -->
              <div v-if="podcastKnot.image" class="text-center">
                <div class="inline-block bg-white rounded-2xl p-4 shadow-lg">
                  <img
                      :src="podcastKnot.image"
                      :alt="`${podcastKnot.name} Knoten`"
                      class="max-w-full h-auto max-h-48 rounded-lg"
                  >
                </div>
                <p class="text-slate-400 text-sm mt-2">{{ podcastKnot.name }}</p>
              </div>
              <!-- Knot name with decorative elements -->
              <div v-if="false" class="text-center mb-6">
                <div
                    class="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-amber-600/20 rounded-full border border-orange-500/30">
                  <div
                      class="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold text-sm">K</span>
                  </div>
                  <h4 class="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                    {{ podcastKnot?.name }}
                  </h4>
                </div>
              </div>

              <!-- Usage section -->
              <div class="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                <div class="flex items-start gap-3">
                  <div
                      class="w-10 h-10 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h5 class="font-semibold text-emerald-300 mb-2">Verwendung</h5>
                    <p class="text-slate-200 leading-relaxed">{{ podcastKnot.usage }}</p>
                  </div>
                </div>
              </div>

              <!-- Explanation section -->
              <div class="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                <div class="flex items-start gap-3">
                  <div
                      class="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h5 class="font-semibold text-blue-300 mb-2">Erklärung</h5>
                    <p class="text-slate-200 leading-relaxed">{{ podcastKnot.explanation }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Steps -->
            <div v-if="podcastKnot.steps && podcastKnot.steps.length" class="space-y-4">
              <div class="flex items-center gap-3 mb-4">
                <div
                    class="w-10 h-10 bg-gradient-to-r from-orange-500/20 to-amber-600/20 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                  </svg>
                </div>
                <h5 class="font-semibold text-orange-300 text-lg">Anleitung</h5>
              </div>

              <!-- Steps List -->
              <div class="space-y-3">
                <div
                    v-for="(step, index) in podcastKnot.steps"
                    :key="index"
                    class="flex gap-4 p-3 bg-slate-700/20 rounded-lg hover:bg-slate-700/30 transition-colors"
                >
                  <!-- Step Number -->
                  <div
                      class="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold text-sm">{{ index + 1 }}</span>
                  </div>

                  <!-- Step Content -->
                  <div class="flex-1 min-w-0">
                    <p class="text-slate-200 text-sm leading-relaxed">{{ step }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Practice tip -->
          <div
              class="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-amber-600/10 rounded-xl border border-orange-500/20">
            <div class="flex items-center gap-3">
              <div
                  class="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                      stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <p class="text-orange-200 text-sm font-medium">
                Übe diesen Knoten praktisch für deine SBF-Prüfung!
                <span v-if="podcastKnot.steps" class="text-orange-300">
          Folge den {{ podcastKnot.steps.length }} Schritten oben.
        </span>
              </p>
            </div>
          </div>
        </CollapsibleCard>


        <ExamSimulator v-if="todaysExam" :exam="todaysExam"/>
      </div>
    </div>
  </div>
</template>

<style scoped>


/* Wave animation */
@keyframes wave {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-25px);
  }
}

.animate-wave {
  animation: wave 3s ease-in-out infinite;
}

/* Boat bounce animation */
@keyframes gentle-bounce {
  0%, 100% {
    transform: translateY(0px) rotate(-2deg);
  }
  50% {
    transform: translateY(-8px) rotate(2deg);
  }
}

.animate-bounce {
  animation: gentle-bounce 2s ease-in-out infinite;
}
</style>
