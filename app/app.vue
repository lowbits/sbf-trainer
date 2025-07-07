<script lang="ts" setup>

import NewUserModal from "~/components/modals/NewUserModal.vue";

useHead({
  bodyAttrs: {
    class: 'bg-slate-900'
  }
})

const userToken = useCookie('sbf_user_token')
</script>

<template>
  <NuxtPwaManifest/>
  <div
      class="relative min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white overflow-hidden">

    <NuxtPage/>


  </div>
</template>
