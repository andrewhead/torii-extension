import * as child_process from "child_process";
import { CommandState, ConsoleLog, FileContents } from "santoku-store";
import { CommandId, OutputType } from "santoku-store/dist/outputs/types";
import { OutputGenerator } from "../config/types";
import { execute } from "./execute";

/**
 * Based on child_process ExecOptions.
 */
export interface ExecutionOptions extends child_process.ExecOptions {
  /**
   * By making the execute function an argument, we can mock it with dependency injection.
   */
  executeFunction?: typeof child_process.exec;
  /**
   * String to run.
   */
  command: string;
}

export interface OutputGeneratorsOptions {
  /**
   * List of configs for output generators.
   */
  configs: OutputGenerator[];
  /**
   * Absolute path of a directory where files can be staged for execution. This directory need
   * not already be created; it will be created if need be. The 'OutputGenerators' object will
   * create new directories in this directory for staging and executing snapshots of the code.
   */
  stagePath: string;
  /**
   * These three function options are intended only for testing the 'OutputGenerators' class.
   */
  execute?: typeof execute;
  cancel?: (jobId: JobId) => void;
  stage?: (fileContents: FileContents) => void;
}

export interface GenerateOutputsOptions {
  /**
   * Contents of files to generate output from.
   */
  fileContents: FileContents;
  /**
   * Optional ID used to identify all output generation tasks created by this request. Can be
   * used to cancel output generation.
   */
  jobId?: JobId;
  /**
   * Optional callback that will be called when execution starts, sometimes when the command has
   * been running for some time and has updates from the console, and when execution finishes.
   */
  callback?: (update: CommandUpdate) => {};
}

export type JobId = string;

export interface CommandUpdate {
  jobId: JobId;
  commandId: CommandId;
  /**
   * Can be used to keep track of the progress of the command's execution.
   */
  state: CommandState;
  /**
   * Will only be defined when the command has first started running.
   */
  type?: OutputType;
  log: ConsoleLog;
}

export interface Jobs {
  [jobId: string]: child_process.ChildProcess[];
}
