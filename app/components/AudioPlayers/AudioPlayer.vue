<script setup lang="ts">

import {onMounted} from "vue";

defineProps<{
  audio: string
}>()


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

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};


onMounted(async () => {
  // Set up continuous time tracking
  const updateTime = (): void => {
    if (audioPlayer.value && !audioPlayer.value.paused) {
      currentTime.value = audioPlayer.value.currentTime;
    }
    requestAnimationFrame(updateTime);
  };
  updateTime();
});
</script>
<template>
  <div class="py-6">
    <!-- Hidden Audio Element -->
    <audio
        ref="audioPlayer"
        :src="audio"
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
        <Icon name="lucide:fast-forward" class="rotate-180"/>
      </button>

      <button
          class="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 transform hover:scale-105"
          :title="isPlaying ? 'Pausieren' : 'Abspielen'"
          @click="togglePlayPause"
      >
        <Icon v-if="!isPlaying" name="lucide:play" size="20"/>
        <Icon v-else name="lucide:pause" size="20"/>
      </button>

      <button
          class="p-3 text-slate-400 hover:text-teal-400 transition-colors rounded-full hover:bg-slate-700/50"
          title="10 Sekunden vor"
          @click="seekForward">
        <Icon name="lucide:fast-forward"/>
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
</style>
