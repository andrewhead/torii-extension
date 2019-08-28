import * as fs from "fs";
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
    fs.mkdir(writeDir, { recursive: true }, err => {
      if (errDefined(err)) {
        reject(err);
      }
      fs.writeFile(writePath, contents, err => {
        if (errDefined(err)) {
          reject(err);
        }
        resolve(filePath);
      });
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
