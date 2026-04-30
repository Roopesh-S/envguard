import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { guard } from "../src/index.js";

// ─── REQUIRED ───────────────────────────────────────────

describe("required", () => {
  it("throws when required var is missing", () => {
    delete process.env.DB_KEY;
    assert.throws(
      () => guard({ DB_KEY: { type: "string", required: true } }),
      /required but not set/,
    );
  });

  it("passes when required var is present", () => {
    process.env.DB_KEY = "mongodb+srv://test";
    const env = guard({ DB_KEY: { type: "string", required: true } });
    assert.strictEqual(env.DB_KEY, "mongodb+srv://test");
  });
});

// ─── DEFAULTS ───────────────────────────────────────────

describe("defaults", () => {
  it("uses default when var is not set", () => {
    delete process.env.PORT;
    const env = guard({ PORT: { type: "number", default: 3000 } });
    assert.strictEqual(env.PORT, 3000);
  });

  it("ignores default when var is set", () => {
    process.env.PORT = "5000";
    const env = guard({ PORT: { type: "number", default: 3000 } });
    assert.strictEqual(env.PORT, 5000);
  });
});

// ─── TYPE: NUMBER ────────────────────────────────────────

describe("type: number", () => {
  it("coerces string to number", () => {
    process.env.PORT = "3000";
    const env = guard({ PORT: { type: "number" } });
    assert.strictEqual(env.PORT, 3000);
  });

  it("throws when value is not a valid number", () => {
    process.env.PORT = "notanumber";
    assert.throws(() => guard({ PORT: { type: "number" } }), /expected number/);
  });
});

// ─── TYPE: BOOLEAN ───────────────────────────────────────

describe("type: boolean", () => {
  it('coerces "true" to true', () => {
    process.env.DEBUG = "true";
    const env = guard({ DEBUG: { type: "boolean" } });
    assert.strictEqual(env.DEBUG, true);
  });

  it('coerces "false" to false', () => {
    process.env.DEBUG = "false";
    const env = guard({ DEBUG: { type: "boolean" } });
    assert.strictEqual(env.DEBUG, false);
  });

  it("throws when value is not true or false", () => {
    process.env.DEBUG = "yes";
    assert.throws(
      () => guard({ DEBUG: { type: "boolean" } }),
      /expected boolean/,
    );
  });
});

// ─── TYPE: STRING ────────────────────────────────────────

describe("type: string", () => {
  it("returns string as-is", () => {
    process.env.DB_KEY = "mongodb+srv://test";
    const env = guard({ DB_KEY: { type: "string" } });
    assert.strictEqual(env.DB_KEY, "mongodb+srv://test");
  });
});

// ─── MINLENGTH ───────────────────────────────────────────

describe("minLength", () => {
  it("passes when string meets minLength", () => {
    process.env.JWT_SECRET = "supersecretkeythatisatleast32chars!!";
    const env = guard({ JWT_SECRET: { type: "string", minLength: 32 } });
    assert.ok(env.JWT_SECRET.length >= 32);
  });

  it("throws when string is below minLength", () => {
    process.env.JWT_SECRET = "short";
    assert.throws(
      () => guard({ JWT_SECRET: { type: "string", minLength: 32 } }),
      /at least 32 characters/,
    );
  });
});

// ─── MULTIPLE ERRORS ─────────────────────────────────────

describe("multiple errors", () => {
  it("throws all errors at once", () => {
    delete process.env.DB_KEY;
    process.env.PORT = "notanumber";
    assert.throws(
      () =>
        guard({
          DB_KEY: { type: "string", required: true },
          PORT: { type: "number" },
        }),
      /envguard/,
    );
  });
});

// ─── EMPTY SCHEMA ────────────────────────────────────────

describe("edge cases", () => {
  it("returns empty object for empty schema", () => {
    const env = guard({});
    assert.deepStrictEqual(env, {});
  });

  it("ignores env vars not in schema", () => {
    process.env.PORT = "3000";
    process.env.RANDOM_VAR = "something";
    const env = guard({ PORT: { type: "number", default: 3000 } });
    assert.strictEqual(env.RANDOM_VAR, undefined);
  });
});

// ─── PROXY / SAFE ACCESS ─────────────────────────────────

describe("proxy / safe access", () => {
  it("throws when missing a validated key", () => {
    delete process.env.OPTIONAL_DB;
    const env = guard({ OPTIONAL_DB: { type: "string" } });
    assert.throws(() => env.OPTIONAL_DB, /Attempted to access undefined environment variable: OPTIONAL_DB/);
  });

  it("does not throw for unvalidated keys in default mode", () => {
    const env = guard({ PORT: { type: "number", default: 3000 } });
    assert.strictEqual(env.UNKNOWN, undefined);
  });

  it("supports .has() method", () => {
    delete process.env.OPTIONAL_DB;
    const env = guard({ OPTIONAL_DB: { type: "string" } });
    assert.strictEqual(env.has("OPTIONAL_DB"), false);

    process.env.DB_URL = "test";
    const env2 = guard({ DB_URL: { type: "string" } });
    assert.strictEqual(env2.has("DB_URL"), true);
  });
});

// ─── STRICT MODE ─────────────────────────────────────────

describe("strict mode", () => {
  it("throws on unvalidated keys when strict is true", () => {
    const env = guard({ PORT: { type: "number", default: 3000 } }, { strict: true });
    assert.throws(() => env.UNKNOWN, /Attempted to access undefined environment variable: UNKNOWN/);
  });

  it("allows standard object methods in strict mode", () => {
    const env = guard({ PORT: { type: "number", default: 3000 } }, { strict: true });
    assert.strictEqual(typeof env.toString, "function");
    assert.strictEqual(typeof env.toJSON, "undefined"); 
  });
});
