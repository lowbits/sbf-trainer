<script setup lang="ts">

import {$fetch} from "ofetch";


const catalog = ref()
const fetchCatalog = async () => {
  const response = await $fetch("/api/import", {
    method: 'POST',
  })

  console.log("RESPONSE IN", response)
  catalog.value = response
}
</script>
<template>
  <div>
    <div class="w-full max-w-4xl mx-auto animate-fade-in">
      <h1>Here</h1>

      <button @click="fetchCatalog">fetch</button>

      <pre>{{catalog}}</pre>
    </div>
  </div>
</template>
