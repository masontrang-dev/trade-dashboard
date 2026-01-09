<script setup>
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps({
  type: {
    type: String,
    default: "text",
  },
  modelValue: {
    type: [String, Number],
    default: "",
  },
  class: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const inputClass = computed(() => {
  return cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    props.class
  );
});

const handleInput = (event) => {
  const value = event.target.value;
  // Convert to number if input type is number
  if (props.type === "number") {
    const numValue = value === "" ? "" : Number(value);
    emit("update:modelValue", numValue);
  } else {
    emit("update:modelValue", value);
  }
};
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :class="inputClass"
    @input="handleInput"
    v-bind="$attrs"
  />
</template>
