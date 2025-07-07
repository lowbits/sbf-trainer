<template>
  <Transition name="modal" appear>
    <div
        class="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <Transition name="modal-content" appear>
        <div
            class="bg-slate-800 rounded-2xl p-6 md:p-8 max-w-lg w-full border border-slate-700 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
          <div class="text-center">
            <!-- Welcome Icon -->
            <div
                class="w-20 h-20 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>

            <h2 class="text-2xl md:text-3xl font-bold text-white mb-3">
              Willkommen an Bord! ⚓
            </h2>
            <p class="text-slate-300 mb-6 text-sm md:text-base leading-relaxed">
              Perfekt! Du hast deinen ersten Schritt Richtung SBF-Schein gemacht.
              Bereit für deine tägliche Portion Segelwissen?
            </p>

            <!-- Daily Challenge CTA -->
            <div
                class="bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-teal-500/30 rounded-xl p-6 mb-6">
              <div class="flex items-center justify-center mb-4">
                <div class="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1h6a2 2 0 011 1v2M7 7h10"/>
                  </svg>
                </div>
              </div>

              <h3 class="text-lg font-semibold text-teal-300 mb-2">
                Daily Challenge
              </h3>
              <p class="text-slate-400 text-sm mb-4">
                Dein tägliches SBF-Lernpaket: Podcast zum Hören, Knoten zum Üben,
                und eine echte Prüfung zum Testen. Alles in einem!
              </p>

              <!-- Challenge Components -->
              <div class="grid grid-cols-3 gap-2 mb-4">
                <div class="text-center p-2 bg-slate-700/30 rounded-lg">
                  <div class="text-teal-400 font-bold text-lg">🎧</div>
                  <div class="text-xs text-slate-300 font-medium">Podcast</div>
                  <div class="text-xs text-slate-500">Wissen to-go</div>
                </div>
                <div class="text-center p-2 bg-slate-700/30 rounded-lg">
                  <div class="text-teal-400 font-bold text-lg">🪢</div>
                  <div class="text-xs text-slate-300 font-medium">Knoten</div>
                  <div class="text-xs text-slate-500">Täglich üben</div>
                </div>
                <div class="text-center p-2 bg-slate-700/30 rounded-lg">
                  <div class="text-teal-400 font-bold text-lg">📋</div>
                  <div class="text-xs text-slate-300 font-medium">Prüfung</div>
                  <div class="text-xs text-slate-500">Echte Fragen</div>
                </div>
              </div>

              <div class="flex items-center justify-center gap-4 text-xs text-slate-500">
                <span>🆓 Kostenlos</span>
                <span>📱 Perfekt für unterwegs</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <!-- Primary CTA: Daily Challenge -->
              <button
                  class="w-full px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 transform hover:scale-[1.02]"
                  @click="$emit('startDailyChallenge')"
              >
                <div class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2-2v-6a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1h6a2 2 0 011 1v2M7 7h10"/>
                  </svg>
                  Daily Challenge entdecken
                </div>
              </button>

              <!-- Secondary CTA: Quick Quiz -->
              <button
                  class="w-full px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl font-medium transition-all duration-300"
                  @click="$emit('startQuickQuiz')"
              >
                <div class="flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  Schnelle Welle (Quick Quiz)
                </div>
                <div class="text-xs text-slate-500 mt-1">
                  Für zwischendurch - auch auf dem stillen Örtchen 🚽
                </div>
              </button>

              <!-- Tertiary: Close/Skip -->
              <button
                  class="w-full px-4 py-2 text-slate-500 hover:text-slate-400 rounded-lg font-medium transition-colors text-sm"
                  @click="$emit('close')"
              >
                Später entscheiden
              </button>
            </div>

            <!-- Optional: Benefits Footer -->
            <div class="mt-6 pt-4 border-t border-slate-700/50">
              <p class="text-xs text-slate-500">
                💡 Tipp: Die Daily Challenge kombiniert Hören, Sehen und Testen -
                der perfekte Mix für nachhaltiges Lernen!
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {

}

defineProps<Props>();

defineEmits<{
  close: [];
  startDailyChallenge: [];
  startQuickQuiz: [];
}>();
</script>

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
