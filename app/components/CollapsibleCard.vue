<script setup lang="ts">
import Card from "~/components/ui/cards/Card.vue";

const props = defineProps<{ defaultOpen?: boolean }>();
const isCollapsed = ref(!(props.defaultOpen ?? false));
const contentId = `collapsible-content-${Math.random().toString(36)}`;

// Smooth height transitions with proper cleanup
const onEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '0';
  element.style.paddingTop = '0';
  element.style.paddingBottom = '0';
  element.offsetHeight; // Force reflow
  element.style.height = element.scrollHeight + 'px';
  element.style.paddingTop = '';
  element.style.paddingBottom = '';
};

const onAfterEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '';
};

const onLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = element.scrollHeight + 'px';
  element.offsetHeight; // Force reflow
  element.style.height = '0';
  element.style.paddingTop = '0';
  element.style.paddingBottom = '0';
};

const onAfterLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '';
  element.style.paddingTop = '';
  element.style.paddingBottom = '';
};
</script>

<template>

  <Card>
    <template #header>
      <div class="relative">
        <slot name="trigger"/>
        <div class="absolute inset-y-0  right-0 inline-flex items-center justify-center px-4">

          <button @click="isCollapsed = !isCollapsed">
            <Icon name="lucide:chevron-down" size="24" class="transition-transform duration-300"
                  :class="{'-rotate-180': isCollapsed}"/>
          </button>
        </div>
      </div>
    </template>

    <Transition
        name="collapse"
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @leave="onLeave"
        @after-leave="onAfterLeave"
    >
      <div
          v-show="!isCollapsed"
          :id="contentId"
          class="overflow-hidden"
      >
        <slot/>
      </div>
    </Transition>
  </Card>
</template>
<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
  padding-top 0.3s cubic-bezier(0.4, 0, 0.2, 1),
  padding-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.collapse-enter-from,
.collapse-leave-to {
  height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
