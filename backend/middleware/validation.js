/**
 * Validation Middleware
 *
 * Express middleware for validating request data using Zod schemas
 */

const { z } = require("zod");

/**
 * Create validation middleware for a given Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to get data from: 'body', 'query', 'params'
 * @returns {Function} Express middleware function
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const validatedData = schema.parse(dataToValidate);

      req[`validated${source.charAt(0).toUpperCase() + source.slice(1)}`] =
        validatedData;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
            code: e.code,
          })),
        });
      }

      next(error);
    }
  };
}

/**
 * Validate request body
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
function validateBody(schema) {
  return validate(schema, "body");
}

/**
 * Validate query parameters
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
function validateQuery(schema) {
  return validate(schema, "query");
}

/**
 * Validate URL parameters
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
function validateParams(schema) {
  return validate(schema, "params");
}

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
};
