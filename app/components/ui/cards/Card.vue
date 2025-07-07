<script setup lang="ts">

interface Props {
  variant?: 'default' | 'glow' | 'orange' | 'teal' | 'blue' | 'green' | 'purple'
  padding?: 'narrow' | 'default'
  glow?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'default'
})

const glowClasses = {
  default: 'from-slate-500 to-slate-600',
  glow: 'from-teal-500 to-teal-600 opacity-30',
  orange: 'from-orange-500 to-amber-600 opacity-30',
  teal: 'from-teal-500 to-teal-600 opacity-30',
  blue: 'from-blue-500 to-blue-600 opacity-30',
  green: 'from-emerald-500 to-emerald-600 opacity-30',
  purple: 'from-purple-500 to-purple-600'
}
</script>

<template>
  <div class="relative">
    <!-- Glow effect -->
    <div
        v-if="glow"
        class="absolute -inset-0.5 bg-gradient-to-r rounded-2xl blur opacity-20"
        :class="glowClasses[variant]"
    />

    <!-- Main card -->
    <div
        class="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl overflow-hidden rounded-2xl"
        :class="{
           'px-6': !$slots.header && padding === 'default',
           'px-2': !$slots.header && padding === 'narrow'
        }"
    >
      <!-- Header slot -->
      <slot v-if="$slots.header" name="header"/>

      <!-- Content -->
      <div
          :class="{
        'p-4': padding === 'narrow',
        'p-6': padding === 'default',
      }">
        <slot/>
      </div>
      <div class="h-1 bg-gradient-to-r" :class="glowClasses[variant]"/>
    </div>
  </div>
</template>
