import { FileContents } from "santoku-store";
import { OutputGenerator } from "../config/types";
import { execute, initOptions } from "./execute";
import {
  ExecutionOptions,
  GenerateOutputsOptions,
  JobId,
  Jobs,
  OutputGeneratorsOptions
} from "./types";

/**
 * Manager of all output generators. Handles requests to run generators on program snapshots.
 */
export class OutputGenerators {
  constructor(options: OutputGeneratorsOptions) {
    this._generators = options.configs;
    this._executeFunction = options.execute || this.execute;
    this._cancelFunction = options.cancel || this._defaultCancel;
    this._stageFunction = options.stage || this.stage;
  }

  /**
   * Generate outputs for a set of files. It's expected that all file paths will be relative
   * rather than absolute, so they can be staged and executed. Returns null if there were no
   * output generators to be run on the file contents.
   */
  generateOutputs(options: GenerateOutputsOptions): JobId | null {
    const { jobId, fileContents } = options;
    if (this._jobs[jobId] !== undefined) {
      this._cancelFunction(jobId);
    }
    this._jobs[jobId] = [];
    let runningJobId = null;
    for (const generator of this._generators) {
      if (generator.when === undefined || generator.when(fileContents)) {
        const stagePath = this._stageFunction(fileContents);
        const executionOptions = initOptions(generator, stagePath);
        const process = this._executeFunction(executionOptions);
        this._jobs[jobId].push(process);
        runningJobId = jobId;
      }
    }
    return runningJobId;
  }

  execute(options: ExecutionOptions) {
    return execute(options);
  }

  stage(fileContents: FileContents) {}

  /**
   * Cancel all output generation tasks associated with ID 'jobId'.
   */
  cancel(jobId: JobId) {
    const result = this._cancelFunction(jobId);
    this._jobs[jobId] = [];
    return result;
  }

  _defaultCancel(jobId: JobId) {
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
}
