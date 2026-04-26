/**
 * Infers the type of a string value.
 * @param {string} value 
 * @returns {string|number|boolean}
 */
export function inferType(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;

  // Check if strictly a numeric string
  if (value !== '' && !isNaN(Number(value)) && !isNaN(parseFloat(value))) {
    return Number(value);
  }

  return value;
}

/**
 * Infers types from process.env string values.
 * @returns {Object} An object with inferred values.
 */
export function inferEnv() {
  const inferred = {};

  for (const [key, value] of Object.entries(process.env)) {
    inferred[key] = inferType(value);
  }

  return inferred;
}
