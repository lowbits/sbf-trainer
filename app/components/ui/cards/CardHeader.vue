<script setup lang="ts">
interface Props {
  variant?: 'default' | 'orange' | 'teal' | 'blue' | 'green' | 'purple'
  title?: string
  subtitle?: string
  icon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  icon: true
})

const variantClasses = {
  default: {
    gradient: 'from-slate-600 to-slate-700',
    text: 'text-white',
    subtitle: 'text-slate-200'
  },
  orange: {
    gradient: 'from-orange-500 to-amber-600',
    text: 'text-white',
    subtitle: 'text-orange-100'
  },
  teal: {
    gradient: 'from-teal-500 to-teal-600',
    text: 'text-white',
    subtitle: 'text-teal-100'
  },
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    text: 'text-white',
    subtitle: 'text-blue-100'
  },
  green: {
    gradient: 'from-emerald-500 to-emerald-600',
    text: 'text-white',
    subtitle: 'text-emerald-100'
  },
  purple: {                                    // ADD THIS
    gradient: 'from-purple-500 to-purple-600',
    text: 'text-white',
    subtitle: 'text-purple-100'
  }
}
</script>

<template>
  <div
      class="bg-gradient-to-r p-4 md:p-6 relative overflow-hidden rounded-t-2xl"
      :class="variantClasses[variant].gradient"
  >
    <!-- Decorative dots pattern for orange variant -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-2 left-4 w-1 h-1 bg-white rounded-full"></div>
      <div class="absolute top-4 left-12 w-1.5 h-1.5 bg-white rounded-full"></div>
      <div class="absolute top-6 left-20 w-1 h-1 bg-white rounded-full"></div>
      <div class="absolute top-3 right-8 w-1 h-1 bg-white rounded-full"></div>
      <div class="absolute top-7 right-16 w-1.5 h-1.5 bg-white rounded-full"></div>
      <div class="absolute bottom-3 left-8 w-1 h-1 bg-white rounded-full"></div>
      <div class="absolute bottom-5 right-12 w-1 h-1 bg-white rounded-full"></div>
    </div>

    <!-- Wave pattern for teal variant -->
    <div v-if="variant === 'teal'" class="absolute inset-0 opacity-10">
      <svg class="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
        <path class="fill-white" d="M0,20 Q100,10 200,20 T400,20 L400,60 L0,60 Z"/>
      </svg>
    </div>

    <div class="relative flex items-center gap-4">
      <!-- Icon slot -->
      <div v-if="icon" class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group">
        <slot name="icon">
          <!-- Default icon if no icon slot provided -->
          <svg
              class="w-8 h-8 text-white transform group-hover:scale-110 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </slot>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 mb-1">
          <h3
              class="text-xl md:text-2xl font-bold"
              :class="variantClasses[variant].text"
          >
            <slot name="title">{{ title }}</slot>
          </h3>
          <div v-if="variant === 'orange'" class="w-2 h-2 bg-white/60 rounded-full animate-pulse"/>
        </div>
        <p
            v-if="subtitle || $slots.subtitle"
            class="text-sm font-medium"
            :class="variantClasses[variant].subtitle"
        >
          <slot name="subtitle">{{ subtitle }}</slot>
        </p>
      </div>

      <!-- Action slot -->
      <div v-if="$slots.action" class="flex-shrink-0">
        <slot name="action"/>
      </div>
    </div>
  </div>

</template>
