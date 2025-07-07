<script setup lang="ts">
const {variant = 'default'} = defineProps<{
  variant?: 'default' | 'primary'
}>()
</script>

<template>
<span
    class="px-3 py-1 text-xs font-medium capitalize rounded-full border"
    :class="{'bg-teal-500/20 text-teal-300 border-teal-500/30': variant === 'primary', 'border-ocean-500/30 bg-ocean-500/20 text-ocean-300': variant === 'default'}">
<slot/>
</span>
</template>
