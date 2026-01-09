import { defineStore } from "pinia";

export const useUIStore = defineStore("ui", {
  state: () => ({
    showRInDollars: true,
    expandedSections: [],
    activeModal: null,
    toasts: [],
    toastIdCounter: 0,
  }),

  getters: {
    hasActiveModal: (state) => state.activeModal !== null,

    isSectionExpanded: (state) => (sectionId) => {
      return state.expandedSections.includes(sectionId);
    },

    activeToasts: (state) => state.toasts,
  },

  actions: {
    toggleRDisplay() {
      this.showRInDollars = !this.showRInDollars;
    },

    setRDisplay(showInDollars) {
      this.showRInDollars = showInDollars;
    },

    toggleSection(sectionId) {
      const index = this.expandedSections.indexOf(sectionId);
      if (index === -1) {
        this.expandedSections.push(sectionId);
      } else {
        this.expandedSections.splice(index, 1);
      }
    },

    expandSection(sectionId) {
      if (!this.expandedSections.includes(sectionId)) {
        this.expandedSections.push(sectionId);
      }
    },

    collapseSection(sectionId) {
      const index = this.expandedSections.indexOf(sectionId);
      if (index !== -1) {
        this.expandedSections.splice(index, 1);
      }
    },

    showModal(modalId, data = null) {
      this.activeModal = { id: modalId, data };
    },

    hideModal() {
      this.activeModal = null;
    },

    addToast(message, type = "info", duration = 5000) {
      const id = ++this.toastIdCounter;
      const toast = {
        id,
        message,
        type,
        timestamp: Date.now(),
      };

      this.toasts.push(toast);

      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id);
        }, duration);
      }

      return id;
    },

    removeToast(id) {
      const index = this.toasts.findIndex((t) => t.id === id);
      if (index !== -1) {
        this.toasts.splice(index, 1);
      }
    },

    clearAllToasts() {
      this.toasts = [];
    },

    showSuccessToast(message, duration = 5000) {
      return this.addToast(message, "success", duration);
    },

    showErrorToast(message, duration = 7000) {
      return this.addToast(message, "error", duration);
    },

    showWarningToast(message, duration = 6000) {
      return this.addToast(message, "warning", duration);
    },

    showInfoToast(message, duration = 5000) {
      return this.addToast(message, "info", duration);
    },
  },

  persist: {
    key: "trade-dashboard-ui",
    storage: localStorage,
    paths: ["showRInDollars", "expandedSections"],
  },
});
