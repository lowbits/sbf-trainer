<script lang="ts" setup>

definePageMeta({
  middleware: "development"
})


const query = useRoute()
const {data} = await useFetch('/api/knots')


</script>

<template>
  <pre>{{data}}</pre>
</template>
