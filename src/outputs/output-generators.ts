import { ConsoleLog, FileContents } from "santoku-store";
import { OutputGenerator } from "../config/types";
import { execute, initOptions } from "./execute";
import { stage } from "./stage";
import {
  ExecutionOptions,
  GenerateOutputsOptions,
  JobId,
  Jobs,
  OutputGeneratorsOptions,
  StageCallback
} from "./types";

/**
 * Manager of all output generators. Handles requests to run generators on program snapshots.
 */
export class OutputGenerators {
  constructor(options: OutputGeneratorsOptions) {
    this._generators = options.configs;
    this._stagePath = options.stagePath;
    this._executeFunction = options.execute || this._execute;
    this._cancelFunction = options.cancel || this._defaultCancel;
    this._stageFunction = options.stage || this._defaultStage;
  }

  /**
   * Generate outputs for a set of files. It's expected that all file paths will be relative
   * rather than absolute, so they can be staged and executed. Returns null if there were no
   * output generators to be run on the file contents.
   */
  generateOutputs(options: GenerateOutputsOptions): JobId | null {
    const { jobId, fileContents } = options;
    const callback =
      options.callback ||
      function() {
        /* noop */
      };
    if (this._jobs[jobId] !== undefined) {
      this._cancelFunction(jobId);
    }
    this._jobs[jobId] = [];
    let runningJobId = null;
    for (const generator of this._generators) {
      const { id: commandId, when } = generator;
      if (when === undefined || when(fileContents)) {
        const stagePath = this._stageFunction(fileContents, (stageDir, _) => {
          if (stageDir !== null) {
            const executionOptions = initOptions(generator, stagePath);
            Object.assign(executionOptions, {
              onUpdate: (log: ConsoleLog) => {
                callback({ jobId, commandId, log, state: "running" });
              },
              onFinished: (log: ConsoleLog) => {
                callback({ jobId, commandId, log, state: "finished" });
              }
            });

            const process = this._executeFunction(executionOptions);
            callback({ jobId, commandId, state: "running", type: generator.type });
            this._jobs[jobId].push(process);
            runningJobId = jobId;
          }
        });
      }
    }
    return runningJobId;
  }

  private _execute(options: ExecutionOptions) {
    return execute(options);
  }

  private _stage(fileContents: FileContents, callback: StageCallback) {
    this._stageFunction(fileContents, callback);
  }

  private _defaultStage(fileContents: FileContents, callback: StageCallback) {
    stage(this._stagePath, fileContents, callback);
  }

  /**
   * Cancel all output generation tasks associated with ID 'jobId'.
   */
  cancel(jobId: JobId) {
    const result = this._cancelFunction(jobId);
    this._jobs[jobId] = [];
    return result;
  }

  private _defaultCancel(jobId: JobId) {
    if (this._jobs[jobId] !== undefined) {
      for (const process of this._jobs[jobId]) {
        process.kill();
      }
    }
  }

  get jobs(): Readonly<Jobs> {
    return this._jobs;
  }

  private _generators: OutputGenerator[];
  private _executeFunction;
  private _cancelFunction;
  private _stageFunction;
  private _jobs: Jobs = {};
  private _stagePath: string;
}
