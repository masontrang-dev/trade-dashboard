<script setup>
import { TabsList } from "radix-vue";
import { cn } from "@/lib/utils";
import { computed } from "vue";

const props = defineProps({
  class: {
    type: String,
    default: "",
  },
});

const listClass = computed(() => {
  return cn(
    "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
    props.class
  );
});
</script>

<template>
  <TabsList :class="listClass" v-bind="$attrs">
    <slot />
  </TabsList>
</template>
