<script setup lang="ts">
const {variant = 'rounded'} = defineProps<{
  variant?: 'rounded' | 'pill'
  total: number,
  current: number
}>()
</script>
<template>
  <div class="mt-4 flex justify-center">
    <div class="flex items-center gap-2">
      <div
          v-for="(count, index) in total" :key="count" class="rounded-full"

          :class="{
            'w-8 h-1.5': variant === 'pill',
            'size-2': variant ==='rounded',
            'bg-teal-500': current === index,
            'bg-slate-600': current !== index
          }"/>
    </div>
  </div>
</template>
