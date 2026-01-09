<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({
  class: {
    type: String,
    default: "",
  },
});

const cardClass = computed(() => {
  return cn(
    "rounded-xl border bg-card text-card-foreground shadow",
    props.class
  );
});
</script>

<template>
  <div :class="cardClass">
    <slot />
  </div>
</template>
