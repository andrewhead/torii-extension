import * as path from "path";
import { readConfig } from "../../src/config/read";

describe("readConfig", () => {
  const TEST_CONFIG_DIR = path.join(__dirname, "configs");

  it("reads a config", () => {
    const { config, error } = readConfig(TEST_CONFIG_DIR, "valid-config.js");
    expect(config).toEqual({
      outputGenerators: [
        {
          id: "generator-id",
          type: "console",
          command: "command"
        }
      ]
    });
    expect(error).toBe(null);
  });

  it("throws an error when the config is invalid", () => {
    const { error } = readConfig(TEST_CONFIG_DIR, "invalid-config.js");
    expect(error).not.toBe(null);
  });

  it("throws an error when the config is missing", () => {
    const { config, error } = readConfig(TEST_CONFIG_DIR, "missing-config.js");
    expect(config).toEqual(null);
    expect(error).not.toBe(null);
  });
});
