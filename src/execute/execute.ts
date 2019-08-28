import * as child_process from "child_process";
import * as _ from "lodash";
import * as path from "path";
import { OutputGenerator } from "../config/types";
import { ExecutionOptions } from "./types";

export function initOptions(generator: OutputGenerator, cwd?: string): child_process.ExecOptions {
  let shellPath = process.env.PATH;
  let extraPaths = undefined;
  if (generator.path !== undefined) {
    if (Array.isArray(generator.path)) {
      extraPaths = generator.path;
    } else if (typeof generator.path === "function") {
      try {
        extraPaths = generator.path(path);
      } catch (e) {
        throw new Error("Error running the 'path' callback'" + e.toString());
      }
    }
    if (extraPaths !== undefined) {
      shellPath = [...extraPaths, shellPath].join(path.delimiter);
    }
  }

  const options: ExecutionOptions = {
    command: generator.command,
    cwd,
    env: _.merge({}, { PATH: shellPath }, generator.environment),
    windowsHide: true
  };
  if (generator.timeout) {
    options.timeout = generator.timeout;
  }
  return options;
}

export function execute(options: ExecutionOptions) {
  const executionFunction = options.executeFunction || child_process.exec;
  executionFunction(options.command, options, (err, stdout, stderr) => {
    console.log("err", err);
    console.log("Stdout", stdout);
    console.log("Stderr", stderr);
  });
}
