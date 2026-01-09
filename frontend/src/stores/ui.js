import { defineStore } from "pinia";
import { toast } from "vue-sonner";

export const useUIStore = defineStore("ui", {
  state: () => ({
    showRInDollars: true,
    expandedSections: [],
    activeModal: null,
  }),

  getters: {
    hasActiveModal: (state) => state.activeModal !== null,

    isSectionExpanded: (state) => (sectionId) => {
      return state.expandedSections.includes(sectionId);
    },
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

    // Toast methods using Sonner
    showSuccessToast(message, duration) {
      return toast.success(message, { duration });
    },

    showErrorToast(message, duration) {
      return toast.error(message, { duration });
    },

    showWarningToast(message, duration) {
      return toast.warning(message, { duration });
    },

    showInfoToast(message, duration) {
      return toast.info(message, { duration });
    },
  },

  persist: {
    key: "trade-dashboard-ui",
    storage: localStorage,
    paths: ["showRInDollars", "expandedSections"],
  },
});
