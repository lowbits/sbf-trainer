<script setup lang="ts">
import {$fetch} from "ofetch";
import {ref, reactive, computed, onMounted, nextTick} from 'vue';

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

interface PodcastHistoryItem {
  date: string;
  audioUrl: string;
  title: string;
  duration: string;
  questionsCount: number;
}

// Mock user data
const user = reactive<User>({
  name: 'Test user',
  subscription: {isPro: true}
});

// Reactive data
const loading = ref<boolean>(false);
const generating = ref<boolean>(false);
const error = ref<string | null>(null);
const todaysPodcast = ref<PodcastData | null>(null);
const podcastHistory = ref<PodcastHistoryItem[]>([]);
const showScript = ref<boolean>(false);

// Podcast questions data
const podcastQuestions = ref<any[]>([]);
const selectedAnswers = ref<Record<string, string>>({});
const questionAnswers = ref<Record<string, boolean>>({});

// Audio player state
const audioPlayer = ref<HTMLAudioElement | null>(null);
const isPlaying = ref<boolean>(false);
const currentTime = ref<number>(0);
const duration = ref<number>(0);
const playbackSpeed = ref<string>('1');

// Volume controls
const volume = ref<number>(1);
const isMuted = ref<boolean>(false);
const previousVolume = ref<number>(1);

// Computed
const progressPercentage = computed<number>(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0;
});

const correctQuestionAnswers = computed<number>(() => {
  return Object.keys(questionAnswers.value).filter(questionId => {
    const question = podcastQuestions.value.find(q => q.id === questionId);
    return question && selectedAnswers.value[questionId] === question.correctAnswer;
  }).length;
});

// Utility methods
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// API methods
const generatePodcast = async (): Promise<void> => {
  console.log("Trying to generate...");
  generating.value = true;
  error.value = null;

  try {
    const result = await $fetch<{
      podcast: PodcastData;
      questions: any[];
    }>('/api/podcast/generate', {
      method: 'POST'
    });

    todaysPodcast.value = result.podcast;
    podcastQuestions.value = result.questions;

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

const loadTodaysPodcast = async (): Promise<void> => {
  loading.value = true;
  try {
    const result = await $fetch<{
      podcast: PodcastData;
      questions: any[];
    }>('/api/podcast/today');

    if (result) {
      todaysPodcast.value = result.podcast;
      podcastQuestions.value = result.questions;

      // Reset question states
      selectedAnswers.value = {};
      questionAnswers.value = {};
    }
  } catch (err) {
    console.error('Error loading today\'s podcast:', err);
  } finally {
    loading.value = false;
  }
};

const loadPodcastHistory = async (): Promise<void> => {
  try {
    /*
    const history = await $fetch<PodcastHistoryItem[]>('/api/podcast/history');
    podcastHistory.value = history;

     */
  } catch (err) {
    console.error('Error loading podcast history:', err);
  }
};

// Audio player methods
const togglePlayPause = (): void => {
  const player = audioPlayer.value;
  if (!player) return;

  if (isPlaying.value) {
    player.pause();
  } else {
    player.play();
  }
};

const seekBackward = (): void => {
  const player = audioPlayer.value;
  if (player) {
    player.currentTime = Math.max(0, player.currentTime - 10);
  }
};

const seekForward = (): void => {
  const player = audioPlayer.value;
  if (player) {
    player.currentTime = Math.min(duration.value, player.currentTime + 10);
  }
};

const seekToPosition = (event: MouseEvent): void => {
  const progressBar = event.currentTarget as HTMLElement;
  const clickPosition = (event.offsetX / progressBar.offsetWidth);
  const player = audioPlayer.value;
  if (player) {
    player.currentTime = clickPosition * duration.value;
  }
};

const changePlaybackSpeed = (): void => {
  const player = audioPlayer.value;
  if (player) {
    player.playbackRate = parseFloat(playbackSpeed.value);
  }
};

// Volume control methods
const updateVolume = (): void => {
  const player = audioPlayer.value;
  if (player) {
    player.volume = volume.value;
    isMuted.value = volume.value === 0;
  }
};

const toggleMute = (): void => {
  if (isMuted.value || volume.value === 0) {
    volume.value = previousVolume.value;
    isMuted.value = false;
  } else {
    previousVolume.value = volume.value;
    volume.value = 0;
    isMuted.value = true;
  }
  updateVolume();
};

// Audio event handlers
const onPlay = (): void => {
  isPlaying.value = true;
};

const onPause = (): void => {
  isPlaying.value = false;
};

const onEnded = (): void => {
  isPlaying.value = false;
};

const onLoadedMetadata = (): void => {
  const player = audioPlayer.value;
  if (player) {
    duration.value = player.duration || 0;
  }
};

const onTimeUpdate = (): void => {
  const player = audioPlayer.value;
  if (player) {
    currentTime.value = player.currentTime;
  }
};

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

const playHistoryPodcast = (podcast: PodcastHistoryItem): void => {
  todaysPodcast.value = {
    audioUrl: podcast.audioUrl,
    script: {
      title: podcast.title,
      dailyIntro: '',
      todaysTopics: '',
      mainContent: [],
      quickTips: [],
      conclusion: '',
      estimatedDuration: podcast.duration,
      date: podcast.date,
      questionsUsed: [],
      metadata: {
        generatedAt: '',
        questionsCount: podcast.questionsCount,
        categories: []
      }
    },
    cached: true
  };

  nextTick(() => {
    audioPlayer.value?.play();
  });
};

// Lifecycle hooks
onMounted(async () => {
  // Set up continuous time tracking
  const updateTime = (): void => {
    if (audioPlayer.value && !audioPlayer.value.paused) {
      currentTime.value = audioPlayer.value.currentTime;
    }
    requestAnimationFrame(updateTime);
  };
  updateTime();

  // Load podcast data if user is Pro
  if (user.subscription?.isPro) {
    await Promise.all([
      loadTodaysPodcast(),
      loadPodcastHistory()
    ]);
  }
});
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
          <div class="inline-flex items-center gap-3 mb-4">
            <img src="/favicon.svg" class="w-10 h-10" alt="sbf trainer icon">
            <h1 class="text-4xl font-bold bg-gradient-to-r from-teal-400 to-teal-400 bg-clip-text text-transparent">
              SBF Trainer
            </h1>
          </div>
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
        <div v-if="loading || generating" class="mt-8 relative">
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

        <!-- Podcast Player -->
        <div v-else-if="todaysPodcast" class="mt-8 relative">
          <!-- Glow Effect -->
          <div
              class="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl blur opacity-30 animate-pulse"/>
          <div
              class="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">

            <!-- Podcast Header -->
            <div class="bg-gradient-to-r from-teal-500 to-teal-600 p-4 md:p-6">
              <div class="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.536 11.293l-1.414 1.414a8 8 0 01-11.313 0l6.364-6.364a8 8 0 0111.313 11.313l-1.414-1.414"/>
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-lg md:text-xl font-semibold text-white break-words">{{
                      todaysPodcast.script.title
                    }}</h3>
                  <p class="text-teal-100 text-sm">Dauer: {{ todaysPodcast.script.estimatedDuration }}</p>
                </div>
              </div>
            </div>

            <!-- Custom Audio Player -->
            <div class="p-6">
              <!-- Hidden Audio Element -->
              <audio
                  ref="audioPlayer"
                  :src="todaysPodcast.audioUrl"
                  style="display: none;"
                  @play="onPlay"
                  @pause="onPause"
                  @ended="onEnded"
                  @loadedmetadata="onLoadedMetadata"
                  @timeupdate="onTimeUpdate"
              >
                Ihr Browser unterstützt das Audio-Element nicht.
              </audio>

              <!-- Custom Progress Bar -->
              <div class="space-y-2 mb-6">
                <div class="flex justify-between text-sm text-slate-400">
                  <span>{{ formatTime(currentTime) }}</span>
                  <span>{{ formatTime(duration) }}</span>
                </div>
                <div
                    class="w-full bg-slate-700 rounded-full h-2 cursor-pointer"
                    @click="seekToPosition"
                >
                  <div
                      class="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-100"
                      :style="{ width: progressPercentage + '%' }"
                  />
                </div>
              </div>

              <!-- Playback Controls -->
              <div class="flex items-center justify-center space-x-6 mb-6">
                <button
                    class="p-3 text-slate-400 hover:text-teal-400 transition-colors rounded-full hover:bg-slate-700/50"
                    title="10 Sekunden zurück"
                    @click="seekBackward">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"/>
                  </svg>
                </button>

                <button
                    class="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 transform hover:scale-105"
                    :title="isPlaying ? 'Pausieren' : 'Abspielen'"
                    @click="togglePlayPause"
                >
                  <svg v-if="!isPlaying" class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                </button>

                <button
                    class="p-3 text-slate-400 hover:text-teal-400 transition-colors rounded-full hover:bg-slate-700/50"
                    title="10 Sekunden vor"
                    @click="seekForward">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"/>
                  </svg>
                </button>
              </div>

              <!-- Volume and Speed Controls -->
              <div class="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                <!-- Volume Control -->
                <div class="flex items-center space-x-3">
                  <button
                      class="p-2 text-slate-400 hover:text-teal-400 transition-colors"
                      :title="isMuted ? 'Ton einschalten' : 'Stumm schalten'"
                      @click="toggleMute"
                  >
                    <svg
                        v-if="isMuted || volume === 0" class="w-5 h-5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                      <path
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                      <path
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
                    </svg>
                    <svg v-else-if="volume < 0.5" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                    </svg>
                  </button>

                  <div class="flex items-center space-x-2">
                    <input
                        v-model="volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        class="w-20 h-2 bg-slate-600 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 slider"
                        @input="updateVolume"
                    >
                    <span class="text-xs text-slate-400 w-10 text-right">{{ Math.round(volume * 100) }}%</span>
                  </div>
                </div>

                <!-- Playback Speed -->
                <div class="flex items-center space-x-2">
                  <span class="text-xs text-slate-400">Speed:</span>
                  <select
                      v-model="playbackSpeed"
                      class="bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-teal-500"
                      @change="changePlaybackSpeed"
                  >
                    <option value="0.75">0.75x</option>
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Script Preview -->
            <div class="border-t border-slate-700/50 p-6">
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
          </div>
        </div>

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
        <div v-if="podcastQuestions && podcastQuestions.length" class="mt-8 relative">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-slate-500 to-slate-600 rounded-2xl blur opacity-20"/>
          <div class="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <svg class="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Fragen aus dieser Episode
            </h3>

            <!-- Question Cards -->
            <div class="space-y-6">
              <div
                  v-for="(question, questionIndex) in podcastQuestions"
                  :key="question.id"
                  class="relative"
              >
                <!-- Glow Effect -->
                <div
                    class="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl blur opacity-30 animate-pulse"/>
                <div
                    class="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 shadow-2xl">

                  <!-- Question Header -->
                  <div class="min-h-[80px] flex flex-col justify-start">
                    <div class="inline-flex items-center gap-2 mb-4">
                      <span
                          class="px-3 py-1 text-xs font-medium capitalize bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30">
                        {{ question.metadata?.category || 'Nautik' }}
                      </span>
                      <span class="text-xs text-slate-400">Frage {{ questionIndex + 1 }}</span>
                    </div>
                    <h4 class="text-xl font-semibold text-slate-100 leading-snug text-pretty">
                      {{ question.question }}
                    </h4>
                  </div>

                  <!-- Image Display -->
                  <div v-if="question.images?.length" class="mt-4 flex justify-center">
                    <div class="bg-white rounded-lg p-4 shadow-lg max-w-xs">
                      <div class="flex gap-2">
                        <img
                            v-for="(img, index) in question.images"
                            :key="index"
                            :src="img"
                            :alt="`${question.question} - Bild ${index + 1}`"
                            :class="question.images.length === 1 ? 'w-full' : 'flex-1'"
                            class="h-auto rounded max-h-48 object-contain"
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Answer Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <button
                        v-for="(answer, answerIndex) in question.answers"
                        :key="answer.id"
                        :class="[
                          'group relative p-4 text-left rounded-xl transition-colors duration-300 touch-manipulation',
                          {
                            // Normal state
                            'bg-slate-700/50 hover:bg-teal-500/20 border border-slate-600/50 hover:border-teal-500/50 hover:shadow-lg': !questionAnswers[question.id],
                            // Selected answer when not yet answered
                            'bg-teal-500/20 border border-teal-500/50': !questionAnswers[question.id] && selectedAnswers[question.id] === answer.id,
                            // Correct answer highlight (after answering)
                            'bg-emerald-500/20 border border-emerald-500/50 shadow-lg shadow-emerald-500/20': questionAnswers[question.id] && answer.id === question.correctAnswer,
                            // Wrong selected answer highlight (after answering)
                            'bg-red-500/20 border border-red-500/50 shadow-lg shadow-red-500/20': questionAnswers[question.id] && selectedAnswers[question.id] === answer.id && answer.id !== question.correctAnswer,
                            // Other answers when answered (dimmed)
                            'bg-slate-700/30 border border-slate-600/30 opacity-70': questionAnswers[question.id] && selectedAnswers[question.id] !== answer.id && answer.id !== question.correctAnswer
                          }
                        ]"
                        style="-webkit-tap-highlight-color: transparent;"
                        :disabled="questionAnswers[question.id]"
                        @click="selectQuestionAnswer(question.id, answer.id)"
                    >
                      <span class="flex items-center gap-3">
                        <span
                            class="w-8 h-8 shrink-0 bg-gradient-to-r rounded-lg flex items-center justify-center font-bold text-sm"
                            :class="{
                              // Normal state
                              'from-slate-600 to-slate-700 text-slate-300 group-hover:from-teal-500 group-hover:to-teal-600 group-hover:text-white': !questionAnswers[question.id] && selectedAnswers[question.id] !== answer.id,
                              // Selected (not answered)
                              'from-teal-500 to-teal-600 text-white': !questionAnswers[question.id] && selectedAnswers[question.id] === answer.id,
                              // Correct answer (answered)
                              'from-emerald-500 to-emerald-600 text-white': questionAnswers[question.id] && answer.id === question.correctAnswer,
                              // Wrong selected answer (answered)
                              'from-red-500 to-red-600 text-white': questionAnswers[question.id] && selectedAnswers[question.id] === answer.id && answer.id !== question.correctAnswer,
                              // Other answers (answered)
                              'from-slate-600 to-slate-700 text-slate-400': questionAnswers[question.id] && selectedAnswers[question.id] !== answer.id && answer.id !== question.correctAnswer
                            }"
                        >
                          {{ String.fromCharCode(65 + answerIndex) }}

                          <!-- Correct/Wrong icons -->
                          <span
                              v-if="questionAnswers[question.id] && answer.id === question.correctAnswer"
                              class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                            </svg>
                          </span>

                          <span
                              v-if="questionAnswers[question.id] && selectedAnswers[question.id] === answer.id && answer.id !== question.correctAnswer"
                              class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                  stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                                  d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </span>
                        </span>

                        <span
                            class="text-sm leading-relaxed"
                            :class="{
                              'text-slate-200': !questionAnswers[question.id],
                              'text-emerald-100 font-medium': questionAnswers[question.id] && answer.id === question.correctAnswer,
                              'text-red-100': questionAnswers[question.id] && selectedAnswers[question.id] === answer.id && answer.id !== question.correctAnswer,
                              'text-slate-400': questionAnswers[question.id] && selectedAnswers[question.id] !== answer.id && answer.id !== question.correctAnswer
                            }"
                        >
                          {{ answer.text }}
                        </span>
                      </span>

                      <!-- Hover overlay -->
                      <span
                          v-if="!questionAnswers[question.id]"
                          class="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-teal-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </button>
                  </div>

                  <!-- Explanation (shown after answering) -->
                  <div
                      v-if="questionAnswers[question.id]"
                      class="mt-6 p-6 rounded-xl backdrop-blur-sm animate-slide-up"
                      :class="{
                        'bg-emerald-500/10 border border-emerald-500/30': selectedAnswers[question.id] === question.correctAnswer,
                        'bg-red-500/10 border border-red-500/30': selectedAnswers[question.id] !== question.correctAnswer
                      }"
                  >
                    <div class="flex items-start gap-4">
                      <div
                          class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          :class="{
                          'bg-emerald-500/20': selectedAnswers[question.id] === question.correctAnswer,
                          'bg-red-500/20': selectedAnswers[question.id] !== question.correctAnswer
                        }"
                      >
                        <svg
                            class="w-5 h-5"
                            :class="{
                            'text-emerald-400': selectedAnswers[question.id] === question.correctAnswer,
                            'text-red-400': selectedAnswers[question.id] !== question.correctAnswer
                          }"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path
                              v-if="selectedAnswers[question.id] === question.correctAnswer"
                              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M5 13l4 4L19 7"
                          />
                          <path
                              v-else
                              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <div>
                        <h5
                            class="font-semibold mb-2"
                            :class="{
                            'text-emerald-300': selectedAnswers[question.id] === question.correctAnswer,
                            'text-red-300': selectedAnswers[question.id] !== question.correctAnswer
                          }"
                        >
                          {{
                            selectedAnswers[question.id] === question.correctAnswer ? 'Richtig!' : 'Nicht ganz richtig'
                          }}
                        </h5>
                        <p class="text-slate-200 text-sm leading-relaxed mb-3">{{ question.explanation }}</p>
                        <div
                            v-if="selectedAnswers[question.id] !== question.correctAnswer"
                            class="flex items-center gap-2 text-xs">
                          <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded">
                            Richtige Antwort: {{
                              String.fromCharCode(65 + question.answers.findIndex(a => a.id === question.correctAnswer))
                            }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- Question Stats -->
            <div v-if="Object.keys(questionAnswers).length > 0" class="mt-6 text-center text-slate-400 text-sm">
              <p>🎯 Richtige Antworten:
                <span class="text-teal-400 font-medium">
                  {{ correctQuestionAnswers }}/{{ Object.keys(questionAnswers).length }}
                </span>
                • 📚 Aus dem Podcast:
                <span class="text-blue-400 font-medium">{{ podcastQuestions.length }} Fragen</span>
              </p>
            </div>

          </div>
        </div>

        <!-- Podcast History -->
        <div v-if="podcastHistory.length && user?.subscription?.isPro" class="mt-8 relative">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-slate-500 to-slate-600 rounded-2xl blur opacity-20"/>
          <div class="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Letzte Podcasts
            </h3>
            <div class="space-y-3">
              <div
                  v-for="podcast in podcastHistory"
                  :key="podcast.date"
                  class="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <div>
                    <p class="font-medium text-slate-200">{{ podcast.title }}</p>
                    <p class="text-sm text-slate-400">{{ formatDate(new Date(podcast.date)) }} • {{
                        podcast.duration
                      }}</p>
                  </div>
                </div>
                <button
                    class="p-2 text-teal-400 hover:text-teal-300 hover:bg-teal-500/20 rounded-lg transition-colors"
                    @click="playHistoryPodcast(podcast)"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom volume slider styling */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-webkit-slider-track {
  background: linear-gradient(to right, #14b8a6 0%, #14b8a6 var(--volume-percent, 100%), #475569 var(--volume-percent, 100%), #475569 100%);
  height: 6px;
  border-radius: 3px;
}

.slider::-moz-range-track {
  background: #475569;
  height: 6px;
  border-radius: 3px;
}

.slider::-moz-range-progress {
  background: #14b8a6;
  height: 6px;
  border-radius: 3px;
}

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

/* Slide up animation */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
