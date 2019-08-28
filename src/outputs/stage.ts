import * as fs from "fs";
import { mkdirp } from "fs-extra";
import * as path from "path";
import { FileContents } from "santoku-store";
import uuidv4 from "uuid/v4";
import { StageCallback } from "./types";

export function stage(baseStagingDir: string, fileContents: FileContents, callback: StageCallback) {
  const newStagingDir = getNewStagingDir(baseStagingDir);
  Promise.all(
    Object.keys(fileContents).map(filePath => {
      return writeFile(newStagingDir, filePath, fileContents[filePath]);
    })
  )
    .then(() => {
      callback(newStagingDir, null);
    })
    .catch(err => {
      /*
       * TODO(andrewhead): Delete the new staging directory if there was an error writing a file.
       */
      callback(null, err);
    });
}

/**
 * File path should be the path at which to write the file, relative to the staging directory.
 * When successful, the returned promise resolves with the path to the file that was
 * successfully written.
 */
function writeFile(stagingDir: string, filePath: string, contents: string): Promise<string> {
  const writePath = path.join(stagingDir, filePath);
  return new Promise((resolve, reject) => {
    const writeDir = path.dirname(writePath);
    /*
     * 'mkdirp' is used here instead of the Node.js 'fs.mkdir' command because for some reason,
     * 'fs.mkdir' with the 'recursive: true' option doesn't work when this code is running from
     * a VSCode extension.
     */
    mkdirp(writeDir)
      .then(() => {
        fs.writeFile(writePath, contents, err => {
          if (errDefined(err)) {
            reject(err);
          }
          resolve(filePath);
        });
      })
      .catch(err => {
        reject(err);
      });
  });
}

function errDefined(err) {
  return err !== undefined && err !== null;
}

function getNewStagingDir(baseStagingDir: string) {
  const newDirectoryName = uuidv4();
  return path.join(baseStagingDir, newDirectoryName);
}
