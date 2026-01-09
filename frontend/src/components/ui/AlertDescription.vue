<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({
  class: {
    type: String,
    default: "",
  },
});

const descriptionClass = computed(() => {
  return cn("text-sm [&_p]:leading-relaxed", props.class);
});
</script>

<template>
  <div :class="descriptionClass">
    <slot />
  </div>
</template>
