import * as path from "path";
import { readConfig } from "../../src/config/read";

describe("readConfig", () => {
  const TEST_CONFIG_DIR = path.join(__dirname, "configs");

  it("reads a config", done => {
    readConfig(
      TEST_CONFIG_DIR,
      (config, err) => {
        expect(config).toEqual({
          outputGenerators: [
            {
              id: "generator-id",
              type: "console",
              command: "command"
            }
          ]
        });
        expect(err).toBe(null);
        done();
      },
      "valid-config.js"
    );
  });

  it("throws an error when the config is missing", done => {
    readConfig(
      TEST_CONFIG_DIR,
      (config, err) => {
        expect(config).toEqual(null);
        expect(err).not.toBe(null);
        done();
      },
      "invalid-config.js"
    );
  });

  it("throws an error when the config is invalid", done => {
    readConfig(
      TEST_CONFIG_DIR,
      (_, err) => {
        expect(err).not.toBe(null);
        done();
      },
      "missing-config.js"
    );
  });
});
