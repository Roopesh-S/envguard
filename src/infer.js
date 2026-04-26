import { coerce, inferType, isBoolean, isNumeric } from "./utils.js";

/**
 * Infers types from process.env string values, with optional overrides and strict mode.
 * @param {Object} [config={}] 
 * @param {Object} [env=process.env]
 * @returns {Object} An object with inferred values.
 */
export function inferEnv(config = {}, env = process.env) {
  const { strict = false, ...overrides } = config;
  const inferred = {};
  const errors = [];

  for (const [key, value] of Object.entries(env)) {
    const override = overrides[key];

    if (override) {
      try {
        inferred[key] = coerce(value, override.type);
      } catch (e) {
        errors.push(`  ✗ ${key} → override failed: ${e.message}, got "${value}"`);
      }
    } else {
      if (strict) {
        // Enforce safe inference
        const lower = value.toLowerCase();
        if (lower === "true" || lower === "false") {
          if (!isBoolean(value)) {
            errors.push(
              `  ✗ ${key} → ambiguous boolean: expected exact "true" or "false", got "${value}"`,
            );
          }
        } else if (!isNaN(parseFloat(value)) && !isNumeric(value)) {
          errors.push(
            `  ✗ ${key} → invalid numeric string: contains non-numeric characters, got "${value}"`,
          );
        }
      }
      inferred[key] = inferType(value);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `\n[envguard] Strict inference failed:\n${errors.join(
        "\n",
      )}\n\nReview your environment variables.`,
    );
  }

  return inferred;
}
