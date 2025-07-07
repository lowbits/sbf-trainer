<script setup lang="ts">
const {full = true} = defineProps<{
  full?: boolean
}>()
</script>
<template>
  <NuxtLink to="/" class="inline-flex items-center gap-3">
    <img src="/favicon.svg" class="w-10 h-10" alt="sbf trainer icon">
    <h1 v-if="full" class="text-4xl font-bold bg-gradient-to-r from-teal-400 to-teal-400 bg-clip-text text-transparent">
      SBF Trainer
    </h1>
  </NuxtLink>
</template>
