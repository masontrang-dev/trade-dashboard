/**
 * Validation Composable
 *
 * Provides form validation functionality using Zod schemas
 */

import { ref, reactive } from "vue";

/**
 * Create a validation composable for a given schema
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Object} Validation utilities
 */
export function useValidation(schema) {
  const errors = reactive({});
  const isValid = ref(true);

  /**
   * Validate data against the schema
   * @param {Object} data - Data to validate
   * @returns {Object} Validation result
   */
  function validate(data) {
    try {
      const validatedData = schema.parse(data);

      Object.keys(errors).forEach((key) => delete errors[key]);
      isValid.value = true;

      return {
        valid: true,
        data: validatedData,
        errors: {},
      };
    } catch (error) {
      const fieldErrors = {};

      error.errors.forEach((e) => {
        const field = e.path[0];
        if (field) {
          fieldErrors[field] = e.message;
        }
      });

      Object.keys(errors).forEach((key) => delete errors[key]);
      Object.assign(errors, fieldErrors);
      isValid.value = false;

      return {
        valid: false,
        data: null,
        errors: fieldErrors,
      };
    }
  }

  /**
   * Validate a single field
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @param {Object} allData - All form data (for cross-field validation)
   * @returns {string|null} Error message or null if valid
   */
  function validateField(field, value, allData = {}) {
    try {
      const dataToValidate = { ...allData, [field]: value };
      schema.parse(dataToValidate);

      if (errors[field]) {
        delete errors[field];
      }

      return null;
    } catch (error) {
      const fieldError = error.errors.find((e) => e.path[0] === field);

      if (fieldError) {
        errors[field] = fieldError.message;
        return fieldError.message;
      }

      if (errors[field]) {
        delete errors[field];
      }

      return null;
    }
  }

  /**
   * Clear all errors
   */
  function clearErrors() {
    Object.keys(errors).forEach((key) => delete errors[key]);
    isValid.value = true;
  }

  /**
   * Clear error for a specific field
   * @param {string} field - Field name
   */
  function clearFieldError(field) {
    if (errors[field]) {
      delete errors[field];
    }
  }

  /**
   * Set a custom error for a field
   * @param {string} field - Field name
   * @param {string} message - Error message
   */
  function setFieldError(field, message) {
    errors[field] = message;
    isValid.value = false;
  }

  /**
   * Check if a field has an error
   * @param {string} field - Field name
   * @returns {boolean}
   */
  function hasError(field) {
    return !!errors[field];
  }

  /**
   * Get error message for a field
   * @param {string} field - Field name
   * @returns {string|undefined}
   */
  function getError(field) {
    return errors[field];
  }

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    setFieldError,
    hasError,
    getError,
  };
}
