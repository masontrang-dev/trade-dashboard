<script setup>
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemText,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "radix-vue";
import { cn } from "@/lib/utils";

defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <SelectRoot
    v-bind="$attrs"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <slot />
  </SelectRoot>
</template>

<script>
export const SelectTriggerComponent = SelectTrigger;
export const SelectValueComponent = SelectValue;
export const SelectContentComponent = SelectContent;
export const SelectItemComponent = SelectItem;
export const SelectItemTextComponent = SelectItemText;
export const SelectGroupComponent = SelectGroup;
export const SelectLabelComponent = SelectLabel;
</script>
