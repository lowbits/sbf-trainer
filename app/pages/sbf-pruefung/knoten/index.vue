<script lang="ts" setup>
import Logo from "~/components/logos/Logo.vue";

definePageMeta({
  middleware: "development"
})

const germanTransliteration: Record<string, string> = {
  'ä': 'ae',
  'ö': 'oe',
  'ü': 'ue',
  'ß': 'ss',
  'Ä': 'Ae',
  'Ö': 'Oe',
  'Ü': 'Ue'
}

function createKnotUrl(knotName: string): string {
  const slug = knotName
      .toLowerCase()
      // Apply German transliteration
      .replace(/[äöüßÄÖÜ]/g, (match) => germanTransliteration[match] || match)
      // Clean up
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

  return `knoten/${slug}`
}

const {data} = useLazyFetch('/api/knots')
</script>

<template>
  <div class="mt-4 max-w-6xl mx-auto  px-4 lg:px-0">
    <div class="text-center">
      <Logo/>
    </div>

    <section class="mt-10">
      <h1 class="text-lg leading-2">Knoten für die SBF - Prüfung</h1>
    </section>

    <div class="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <NuxtLink v-for="(knot, index) in data" :key="knot.name" :to="createKnotUrl(knot.name)" class="relative bg-gray-50 p-4 h-[280px] rounded-xl">
        <div class="absolute">
          <p class="text-sm text-gray-500">
            {{ knot.name }}
          </p>
        </div>
        <div
            class="mt-12 aspect-square overflow-hidden rounded-lg bg-gray-100"
        >
          <img
              :src="knot.image"
              :alt="knot.name"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          >
        </div>
        <div
            v-if="index > 2"
            class="z-10 bg-gray-200 border-3 border-gray-50 rounded-full flex items-center justify-center p-2.5 absolute right-2 bottom-5">

          <Icon name="lucide:lock" size="14"/>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
