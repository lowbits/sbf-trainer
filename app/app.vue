<script lang="ts" setup>

useHead({
  bodyAttrs: {
    class: 'bg-slate-900'
  }
})

</script>

<template>
  <div
      class="relative min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white overflow-hidden">
    <NuxtPwaManifest/>
    <NuxtPage/>


  </div>
</template>
