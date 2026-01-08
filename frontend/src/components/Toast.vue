<template>
  <transition name="toast-fade">
    <div v-if="visible" class="toast" :class="type">
      <div class="toast-icon">
        <span v-if="type === 'success'">✓</span>
        <span v-else-if="type === 'error'">✕</span>
        <span v-else-if="type === 'warning'">⚠</span>
        <span v-else>ℹ</span>
      </div>
      <div class="toast-content">
        <div class="toast-message">{{ message }}</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "info",
    validator: (value) =>
      ["success", "error", "warning", "info"].includes(value),
  },
  duration: {
    type: Number,
    default: 3000,
  },
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const visible = ref(props.show);
let timeout = null;

watch(
  () => props.show,
  (newVal) => {
    visible.value = newVal;
    if (newVal) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        visible.value = false;
        emit("close");
      }, props.duration);
    }
  }
);
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  z-index: 10000;
  min-width: 300px;
  max-width: 500px;
  font-size: 0.95rem;
}

.toast.success {
  background: linear-gradient(
    135deg,
    rgba(39, 174, 96, 0.95) 0%,
    rgba(34, 153, 84, 0.95) 100%
  );
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toast.error {
  background: linear-gradient(
    135deg,
    rgba(231, 76, 60, 0.95) 0%,
    rgba(192, 57, 43, 0.95) 100%
  );
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toast.warning {
  background: linear-gradient(
    135deg,
    rgba(243, 156, 18, 0.95) 0%,
    rgba(230, 126, 34, 0.95) 100%
  );
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toast.info {
  background: linear-gradient(
    135deg,
    rgba(52, 152, 219, 0.95) 0%,
    rgba(41, 128, 185, 0.95) 100%
  );
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toast-icon {
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.toast-content {
  flex: 1;
}

.toast-message {
  font-weight: 500;
  line-height: 1.4;
}

.toast-fade-enter-active {
  animation: toast-slide-in 0.3s ease-out;
}

.toast-fade-leave-active {
  animation: toast-slide-out 0.2s ease-in;
}

@keyframes toast-slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .toast {
    top: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
  }
}
</style>
