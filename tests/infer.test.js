import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { inferEnv } from "../src/index.js";

describe("inferEnv", () => {
  // ─── NUMBER INFERENCE ───────────────────────────────────
  describe("number inference", () => {
    it("infers integers", () => {
      const env = inferEnv({}, { TEST_NUM: "123" });
      assert.strictEqual(env.TEST_NUM, 123);
    });

    it("infers floats", () => {
      const env = inferEnv({}, { TEST_NUM: "45.67" });
      assert.strictEqual(env.TEST_NUM, 45.67);
    });

    it("infers zero", () => {
      const env = inferEnv({}, { TEST_NUM: "0" });
      assert.strictEqual(env.TEST_NUM, 0);
    });
  });

  // ─── BOOLEAN INFERENCE ──────────────────────────────────
  describe("boolean inference", () => {
    it('infers "true"', () => {
      const env = inferEnv({}, { TEST_BOOL: "true" });
      assert.strictEqual(env.TEST_BOOL, true);
    });

    it('infers "false"', () => {
      const env = inferEnv({}, { TEST_BOOL: "false" });
      assert.strictEqual(env.TEST_BOOL, false);
    });
  });

  // ─── STRING FALLBACK ────────────────────────────────────
  describe("string fallback", () => {
    it("falls back to string for non-numeric/non-boolean", () => {
      const env = inferEnv({}, { TEST_STR: "hello world" });
      assert.strictEqual(env.TEST_STR, "hello world");
    });

    it("treats botched types as strings in non-strict mode", () => {
      const env = inferEnv({}, { TEST_STR: "123abc" });
      assert.strictEqual(env.TEST_STR, "123abc");
    });
  });

  // ─── OVERRIDES ──────────────────────────────────────────
  describe("overrides", () => {
    it("uses override for specific keys", () => {
      const env = inferEnv({ TEST_NUM: { type: "number" } }, { TEST_NUM: "3000" });
      assert.strictEqual(env.TEST_NUM, 3000);
    });

    it("throws when override fails", () => {
      assert.throws(
        () => inferEnv({ TEST_NUM: { type: "number" } }, { TEST_NUM: "notanumber" }),
        /override failed/,
      );
    });
  });

  // ─── STRICT MODE ────────────────────────────────────────
  describe("strict mode", () => {
    it("throws for botched numbers in strict mode", () => {
      assert.throws(
        () => inferEnv({ strict: true }, { TEST_NUM: "123abc" }),
        /invalid numeric string/,
      );
    });

    it("throws for ambiguous booleans in strict mode", () => {
      assert.throws(
        () => inferEnv({ strict: true }, { TEST_BOOL: "True" }),
        /ambiguous boolean/,
      );
    });

    it("passes for valid types in strict mode", () => {
      const source = {
        TEST_NUM: "123",
        TEST_BOOL: "true",
        TEST_STR: "plain_string",
      };
      const env = inferEnv({ strict: true }, source);
      assert.strictEqual(env.TEST_NUM, 123);
      assert.strictEqual(env.TEST_BOOL, true);
      assert.strictEqual(env.TEST_STR, "plain_string");
    });
  });
});
