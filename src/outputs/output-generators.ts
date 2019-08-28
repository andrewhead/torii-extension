import { ConsoleLog, FileContents } from "santoku-store";
import { OutputGenerator } from "../config/types";
import { execute, initOptions } from "./execute";
import { stage } from "./stage";
import {
  CommandUpdate,
  CommandUpdateListener,
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
    this._executeFunction = options.execute || this.execute;
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
    if (this._jobs[jobId] !== undefined) {
      this._cancelFunction(jobId);
    }
    this._jobs[jobId] = [];
    let runningJobId = null;
    for (const generator of this._generators) {
      if (generator.when === undefined || generator.when(fileContents)) {
        const stagePath = this._stageFunction(fileContents, (stageDir, _) => {
          if (stageDir !== null) {
            const executionOptions = initOptions(generator, stagePath);
            executionOptions.onUpdate = this.onProcessUpdate.bind(this, jobId, generator);
            executionOptions.onFinished = this.onProcessFinished.bind(this, jobId, generator);
            const process = this._executeFunction(executionOptions);
            this.reportProcessUpdate({
              jobId: jobId,
              commandId: generator.id,
              state: "running",
              type: generator.type
            });
            this._jobs[jobId].push(process);
            runningJobId = jobId;
          }
        });
      }
    }
    return runningJobId;
  }

  /**
   * Listen to command updates. To unsubscribe from updates, call the returned function.
   */
  subscribe(listener: CommandUpdateListener) {
    this._listeners.push(listener);
    return function() {
      const index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    };
  }

  reportProcessUpdate(update: CommandUpdate) {
    for (const listener of this._listeners) {
      listener(update);
    }
  }

  onProcessUpdate(jobId: JobId, generator: OutputGenerator, log: ConsoleLog) {
    this.reportProcessUpdate({
      jobId,
      commandId: generator.id,
      state: "running",
      log
    });
  }

  onProcessFinished(jobId: JobId, generator: OutputGenerator, log: ConsoleLog) {
    this.reportProcessUpdate({
      jobId,
      commandId: generator.id,
      state: "finished",
      log
    });
  }

  execute(options: ExecutionOptions) {
    return execute(options);
  }

  stage(fileContents: FileContents, callback: StageCallback) {
    this._stageFunction(fileContents, callback);
  }

  _defaultStage(fileContents: FileContents, callback: StageCallback) {
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
  private _stagePath: string;
  private _listeners: CommandUpdateListener[] = [];
}
