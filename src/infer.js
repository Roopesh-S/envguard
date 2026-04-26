import { coerce, inferType } from "./utils.js";

/**
 * Infers types from process.env string values, with optional overrides.
 * @param {Object} [overrides={}] 
 * @returns {Object} An object with inferred values.
 */
export function inferEnv(overrides = {}) {
  const inferred = {};

  for (const [key, value] of Object.entries(process.env)) {
    const override = overrides[key];

    if (override) {
      try {
        inferred[key] = coerce(value, override.type);
      } catch (e) {
        throw new Error(`[envguard] Override failed for ${key}: ${e.message}, got "${value}"`);
      }
    } else {
      inferred[key] = inferType(value);
    }
  }

  return inferred;
}
