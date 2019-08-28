import * as path from "path";
import { FileContents, OutputType } from "santoku-store";

export interface Config {
  /**
   * List of output generators.
   */
  outputGenerators: OutputGenerator[];
}

/**
 * A command that generates outputs.
 */
export interface OutputGenerator {
  /**
   * A unique and descriptive name of the output this emitter produces.
   */
  id: string;
  /**
   * How the output should be shown in the Santoku editor.
   */
  type: OutputType;
  /**
   * Callback that decides whether to emit an output for a snippet. Could include rules that
   * check for specific filenames or contents. If not defined, then the command will always
   * run whenever the file contents change.
   */
  when?: (fileContents: FileContents) => boolean;
  /*
   * Shell command to execute. Depending on the Santoku extension, this may be able to include
   * variables (for instance, ${file} to substitute in the name of a project's main file).
   * Output will be collected from the stdout and stderr of running the command.
   */
  command: string;
  /**
   * Directories to add to the system path before executing the command. Can be defined either as
   * a callback that takes a reference to the Node 'path' API and returns a list of paths as strings,
   * or just as a static list of paths as strings.
   */
  path?: ((pathRef: typeof path) => string[]) | string[];
  /**
   * Dictionary of environment variables to set when running the command. If you want to override
   * PATH, then you should do with the 'path' field instead of the environment variables. If you
   * write it here, it will overwrite the value set from the 'path' field.
   */
  environment?: EnvironmentVariables;
  /**
   * Time in milliseconds to wait before terminating the command. Check the editor extension for
   * the default value. Use this to prevent commands from hanging indefinitely.
   */
  timeout?: number;
}

interface EnvironmentVariables {
  [variableName: string]: string;
}
