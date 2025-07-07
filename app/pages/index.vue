<!-- pages/index.vue -->
<script setup lang="ts">
import Logo from "~/components/logos/Logo.vue";
import Card from "~/components/ui/cards/Card.vue";
import CardHeader from "~/components/ui/cards/CardHeader.vue";

definePageMeta({
  middleware: 'auth'
})

const userToken = useCookie('sbf_user_token')

if (!userToken.value) {
  throw createError({statusCode: 401})
}
</script>
<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-6xl w-full">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <div
            class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-full mb-6">
          <Logo :full="false" />
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Willkommen zurück, Kapitän! ⚓
        </h1>
        <p class="text-xl text-slate-400 max-w-2xl mx-auto">
          Bereit für deine nächste Lerneinheit? Wähle deinen Kurs und steche in See!
        </p>
      </div>

      <!-- Action Cards -->
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Daily Challenge Card -->
        <NuxtLink to="/daily" class="block group h-full">
          <Card
              variant="purple" glow
              class="h-full transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-purple-500/25">
            <template #header>
              <CardHeader variant="purple" title="Daily Challenge" subtitle="Dein komplettes Lernpaket für heute">
                <template #icon>
                  <svg
                      class="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1h6a2 2 0 011 1v2M7 7h10"/>
                  </svg>
                </template>
              </CardHeader>
            </template>

            <div class="space-y-6 flex flex-col h-full">
              <!-- Features Grid -->
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-4 bg-slate-700/30 rounded-xl group-hover:bg-slate-600/40 transition-colors">
                  <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9.536 8.464a5 5 0 000 7.072M6.708 6.636a9 9 0 000 14.142"/>
                    </svg>
                  </div>
                  <h4 class="font-semibold text-white text-sm mb-1">Podcast</h4>
                  <p class="text-xs text-slate-400">Wissen zum Hören</p>
                </div>

                <div class="text-center p-4 bg-slate-700/30 rounded-xl group-hover:bg-slate-600/40 transition-colors">
                  <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                    </svg>
                  </div>
                  <h4 class="font-semibold text-white text-sm mb-1">Knoten</h4>
                  <p class="text-xs text-slate-400">Täglich üben</p>
                </div>

                <div class="text-center p-4 bg-slate-700/30 rounded-xl group-hover:bg-slate-600/40 transition-colors">
                  <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <h4 class="font-semibold text-white text-sm mb-1">Prüfung</h4>
                  <p class="text-xs text-slate-400">Echte Fragen</p>
                </div>
              </div>

              <!-- Spacer für gleiche Höhe -->
              <div class="flex-1"></div>

              <!-- CTA -->
              <div
                  class="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-transparent rounded-xl border border-purple-500/20">
                <div>
                  <p class="text-purple-300 font-medium">Heute verfügbar</p>
                  <p class="text-xs text-slate-400">Komplett kostenlos</p>
                </div>
                <div
                    class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <svg
                      class="w-4 h-4 text-purple-400 transform group-hover:translate-x-0.5 transition-transform"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </NuxtLink>

        <!-- Schnelle Welle Card -->
        <NuxtLink to="/schnelle-welle" class="block group">
          <Card
              variant="blue" :glow="true"
              class="h-full transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-blue-500/25">
            <template #header>
              <CardHeader variant="blue" title="Schnelle Welle" subtitle="Quick Quiz für zwischendurch">
                <template #icon>
                  <svg
                      class="w-8 h-8 text-white group-hover:animate-bounce" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </template>
              </CardHeader>
            </template>

            <div class="space-y-6 flex flex-col h-full">
              <!-- Quick Stats -->
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-4 bg-slate-700/30 rounded-xl group-hover:bg-slate-600/40 transition-colors">
                  <div class="text-2xl font-bold text-blue-400 mb-1">5min</div>
                  <p class="text-xs text-slate-400">Schnelle Runden</p>
                </div>
                <div class="text-center p-4 bg-slate-700/30 rounded-xl group-hover:bg-slate-600/40 transition-colors">
                  <div class="text-2xl font-bold text-blue-400 mb-1">📱</div>
                  <p class="text-xs text-slate-400">Überall lernen</p>
                </div>
              </div>

              <!-- Fun Fact -->
              <div
                  class="p-4 bg-gradient-to-r from-blue-500/10 to-transparent rounded-xl border border-blue-500/20">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span class="text-sm">🚽</span>
                  </div>
                  <h4 class="font-semibold text-blue-300">Perfekt für das stille Örtchen</h4>
                </div>
                <p class="text-xs text-slate-400">Nutze jede freie Minute zum Lernen - selbst die privatesten!</p>
              </div>

              <!-- Spacer für gleiche Höhe -->
              <div class="flex-1"></div>

              <!-- CTA -->
              <div
                  class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-transparent rounded-xl border border-blue-500/20">
                <div>
                  <p class="text-blue-300 font-medium">Jederzeit verfügbar</p>
                  <p class="text-xs text-slate-400">Keine Vorbereitung nötig</p>
                </div>
                <div
                    class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <svg
                      class="w-4 h-4 text-blue-400 transform group-hover:translate-x-0.5 transition-transform"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </NuxtLink>
      </div>

      <!-- Stats Footer -->
      <div class="mt-12 text-center">
        <div class="inline-flex items-center gap-6 px-6 py-3 bg-slate-800/50 rounded-full border border-slate-700/50">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            <span class="text-sm text-slate-400">Online</span>
          </div>
          <div class="w-px h-4 bg-slate-600"/>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm text-slate-400">Dein Fortschritt wird gespeichert</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
