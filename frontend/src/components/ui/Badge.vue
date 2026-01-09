<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({
  variant: {
    type: String,
    default: "default",
    validator: (value) =>
      ["default", "secondary", "destructive", "outline"].includes(value),
  },
  class: {
    type: String,
    default: "",
  },
});

const badgeClass = computed(() => {
  const variants = {
    default:
      "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
    secondary:
      "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
    outline: "text-foreground",
  };

  return cn(
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variants[props.variant],
    props.class
  );
});
</script>

<template>
  <div :class="badgeClass">
    <slot />
  </div>
</template>
