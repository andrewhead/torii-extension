import * as child_process from "child_process";
import { CommandState, ConsoleLog, FileContents } from "santoku-store";
import { CommandId, OutputType } from "santoku-store";
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
   * Command to run.
   */
  command: string;
  /**
   * Callback invoked whenever new data has come in to stdout or stderr.
   */
  onUpdate?: (log: ConsoleLog) => void;
  /**
   * Callback invoked whenever execution has finished.
   */
  onFinished?: (log: ConsoleLog) => void;
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
  stage?: (fileContents: FileContents, callback: StageCallback) => void;
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
  callback?: CommandUpdateListener;
}

/**
 * 'stageDir' is a new directory created to stage file contents. It's 'null' if there was an error in staging.
 * 'err' An error from staging the file contents. It's 'null' if there was no error.
 */
export type StageCallback = (stageDir: string | null, err: any | null) => void;

export type JobId = string;

export type CommandUpdate = CommandStartedUpdate | CommandLogUpdate;

interface BaseCommandUpdate {
  jobId: JobId;
  commandId: CommandId;
  /**
   * Can be used to keep track of the progress of the command's execution.
   */
  state: CommandState;
}

export interface CommandStartedUpdate extends BaseCommandUpdate {
  state: "started";
  type: OutputType;
}

export interface CommandLogUpdate extends BaseCommandUpdate {
  state: "running" | "finished";
  log: ConsoleLog;
}

export type CommandUpdateListener = (update: CommandUpdate) => void;

export interface Jobs {
  [jobId: string]: child_process.ChildProcess[];
}
