/**
 * Checks if a string value represents a boolean.
 * @param {string} value 
 * @returns {boolean}
 */
export function isBoolean(value) {
  return value === "true" || value === "false";
}

/**
 * Checks if a string value represents a number.
 * @param {string} value 
 * @returns {boolean}
 */
export function isNumeric(value) {
  return value !== "" && !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

/**
 * Coerces a value based on the specified type.
 * @param {string} value 
 * @param {string} type 
 * @returns {*}
 * @throws {Error} If coercion fails
 */
export function coerce(value, type) {
  if (type === "number") {
    const num = Number(value);
    if (isNaN(num)) throw new Error("expected number");
    return num;
  } else if (type === "boolean") {
    if (!isBoolean(value)) {
      throw new Error("expected boolean (true/false)");
    }
    return value === "true";
  }
  return value;
}

/**
 * Infers the type of a string value.
 * @param {string} value 
 * @returns {string|number|boolean}
 */
export function inferType(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (isNumeric(value)) return Number(value);
  return value;
}
