import { validate } from "../../src/config/validate";

/**
 * Extend this for tests of optional properties.
 */
const BASE_CONFIG = {
  id: "generator-id",
  type: "console",
  command: "ls"
};

describe("validate", () => {
  it("produces a descriptive error message", () => {});

  describe("validates id", () => {
    it("requires id", () => {
      expect(
        validate(
          wrap({
            type: "console",
            command: "ls"
          })
        ).valid
      ).toBe(false);
    });
  });

  describe("validates type", () => {
    it("requires type", () => {
      expect(
        validate(
          wrap({
            id: "generator-id",
            command: "ls"
          })
        ).valid
      ).toBe(false);
    });

    it("fails with invalid type", () => {
      expect(
        validate(
          wrap({
            id: "generator-id",
            type: "invalid",
            command: "ls"
          })
        ).valid
      ).toBe(false);
    });
  });

  describe("validates when", () => {
    it("succeeds with a 1-argument function", () => {
      expect(
        validate(
          wrap({
            ...BASE_CONFIG,
            when: fileContents => true
          })
        ).valid
      ).toBe(true);
    });

    it("fails without a function", () => {
      expect(
        validate(
          wrap({
            ...BASE_CONFIG,
            when: "string-value"
          })
        ).valid
      ).toBe(false);
    });
  });

  describe("validates path", () => {
    it("succeeds with a list of strings", () => {
      expect(
        validate(
          wrap({
            ...BASE_CONFIG,
            path: ["path-0", "path-1"]
          })
        ).valid
      ).toBe(true);
    });

    it("succeeds with a function", () => {
      expect(
        validate(
          wrap({
            ...BASE_CONFIG,
            path: () => []
          })
        ).valid
      ).toBe(true);
    });

    it("fails with something else", () => {
      expect(
        validate(
          wrap({
            ...BASE_CONFIG,
            path: "string-value"
          })
        ).valid
      ).toBe(false);
    });
  });

  describe("validates environment", () => {
    it("succeeds on a dictionary", () => {
      expect(
        validate(
          wrap({
            ...BASE_CONFIG,
            environment: {
              VAR: "VALUE"
            }
          })
        ).valid
      ).toBe(true);
    });

    it("fails on non-string values", () => {
      expect(
        validate(
          wrap({
            ...BASE_CONFIG,
            environment: {
              VAR: 1 // numeric value, not allowed
            }
          })
        ).valid
      ).toBe(false);
    });

    it("fails on a non-dictionary type", () => {
      expect(
        validate(
          wrap({
            ...BASE_CONFIG,
            environment: "string-value"
          })
        ).valid
      ).toBe(false);
    });
  });

  describe("validates timeout", () => {
    it("succeeds with an integer", () => {
      expect(
        validate(
          wrap({
            ...BASE_CONFIG,
            timeout: 1000
          })
        ).valid
      ).toBe(true);
    });

    it("fails with a floating point number", () => {
      expect(
        validate({
          ...BASE_CONFIG,
          timeout: 1000.1 // floating point
        }).valid
      ).toBe(false);
    });

    it("fails with a negative number", () => {
      expect(
        validate(
          wrap({
            ...BASE_CONFIG,
            timeout: -1000
          })
        ).valid
      ).toBe(false);
    });

    it("fails with a non-number value", () => {
      expect(
        validate(
          wrap({
            ...BASE_CONFIG,
            timeout: "1000"
          })
        ).valid
      ).toBe(false);
    });
  });
});

function wrap(generatorConfig: any) {
  return {
    outputGenerators: [generatorConfig]
  };
}
