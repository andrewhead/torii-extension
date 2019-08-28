import * as child_process from "child_process";

/**
 * Based on child_process ExecOptions
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
