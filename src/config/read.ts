import * as path from "path";
import { validate } from "./validate";

export const CONFIG_NAME = "tory.js";

/**
 * Load in the configuration file for the project. The configuration, and any errors, will be
 * passed as arguments to 'callback'.
 */
export function readConfig(workspaceDir: string, configName = CONFIG_NAME) {
  const relativeConfigPath = path.relative(__dirname, path.join(workspaceDir, configName));
  try {
    /*
     * Delete cache entry for config every time, so it can be reloaded if it changed.
     */
    const resolvedConfigPath = require.resolve(relativeConfigPath);
    if (require.cache[resolvedConfigPath] !== undefined) {
      delete require.cache[resolvedConfigPath];
    }
    const config = require(relativeConfigPath);
    const { error } = validate(config);
    return { config, error };
  } catch (error) {
    return { config: null, error };
  }
}
