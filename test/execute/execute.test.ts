import { OutputType } from "santoku-store";
import { initOptions } from "../../src/outputs/execute";

describe("initOptions", () => {
  const BASE_CONFIG = {
    id: "generator-id",
    command: "command",
    type: "console" as OutputType
  };

  it("sets cwd", () => {
    const cwd = "/path/to/cwd";
    expect(initOptions(BASE_CONFIG, cwd)).toMatchObject({ cwd });
  });

  it("populates path using a callback", () => {
    const config = {
      ...BASE_CONFIG,
      path: () => ["/extra/path"]
    };
    const env = initOptions(config).env;
    expect(env.PATH).not.toBe(undefined);
    expect(env.PATH).toMatch("/extra/path");
  });

  it("populates path using a list of strings", () => {
    const config = {
      ...BASE_CONFIG,
      path: ["/extra/path"]
    };
    const env = initOptions(config).env;
    expect(env.PATH).not.toBe(undefined);
    expect(env.PATH).toMatch("/extra/path");
  });

  it("sets all other properties from the config", () => {
    const timeout = 1000;
    const environment = {
      VAR: "VALUE"
    };
    const config = {
      ...BASE_CONFIG,
      timeout,
      environment
    };
    expect(initOptions(config)).toMatchObject({
      command: "command",
      env: environment,
      timeout
    });
  });
});
