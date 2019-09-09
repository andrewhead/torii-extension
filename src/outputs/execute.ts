import * as child_process from "child_process";
import * as _ from "lodash";
import * as path from "path";
import { ConsoleLog } from "santoku-store";
import { OutputGenerator } from "../config/types";
import { ExecutionOptions } from "./types";

export function execute(options: ExecutionOptions) {
  const executionFunction = options.executeFunction || child_process.exec;
  const log = { contents: "", stdoutRanges: [], stderrRanges: [] };
  const throttledUpdate = _.throttle(() => {
    if (options.onUpdate !== undefined) {
      options.onUpdate(log);
    }
  }, 500);
  const process = executionFunction(options.command, options, (_, __, ___) => {
    if (options.onFinished) {
      throttledUpdate.cancel();
      options.onFinished(log);
    }
  });
  process.stdout.on("data", chunk => {
    updateLog(log, chunk, "stdout");
    throttledUpdate();
  });
  process.stderr.on("data", chunk => {
    updateLog(log, chunk, "stderr");
    throttledUpdate();
  });
  return process;
}

export function initOptions(generator: OutputGenerator, cwd?: string): ExecutionOptions {
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

function updateLog(log: ConsoleLog, chunk: any, dataType: "stdout" | "stderr") {
  const data = chunk.toString();
  const range = { start: log.contents.length, end: log.contents.length + data.length };
  log.contents = log.contents + data;
  if (dataType === "stdout") {
    log.stdoutRanges.push(range);
  } else if (dataType === "stderr") {
    log.stderrRanges.push(range);
  }
}
