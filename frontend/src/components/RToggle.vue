<template>
  <div class="r-toggle">
    <label class="toggle-label">
      <input type="checkbox" v-model="showRValues" @change="handleToggle" />
      <span class="toggle-slider"></span>
      <span class="toggle-text">
        {{ showRValues ? "R Values" : "Dollars" }}
      </span>
    </label>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const emit = defineEmits(["toggle-changed"]);

const showRValues = ref(false);

const handleToggle = () => {
  localStorage.setItem("showRValues", showRValues.value.toString());
  emit("toggle-changed", showRValues.value);
};

onMounted(() => {
  const saved = localStorage.getItem("showRValues");
  if (saved) {
    showRValues.value = saved === "true";
    emit("toggle-changed", showRValues.value);
  }
});
</script>

<style scoped>
.r-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  color: #5a6c7d;
  user-select: none;
}

.toggle-label input[type="checkbox"] {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 50px;
  height: 24px;
  background-color: #ccc;
  border-radius: 12px;
  margin-right: 10px;
  transition: background-color 0.3s ease;
}

.toggle-slider::before {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-label input[type="checkbox"]:checked + .toggle-slider {
  background-color: #3498db;
}

.toggle-label input[type="checkbox"]:checked + .toggle-slider::before {
  transform: translateX(26px);
}

.toggle-text {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 600;
}

@media (max-width: 768px) {
  .toggle-text {
    font-size: 0.85rem;
  }

  .toggle-slider {
    width: 44px;
    height: 22px;
  }

  .toggle-slider::before {
    width: 18px;
    height: 18px;
  }

  .toggle-label input[type="checkbox"]:checked + .toggle-slider::before {
    transform: translateX(22px);
  }
}
</style>
