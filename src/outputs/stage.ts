import * as path from "path";
// import { SnippetId, State } from "santoku-store";
import uuidv4 from "uuid/v4";

/*
 * TODO(andrewhead): randomly generate staging directory.
 */
function getStagingDir(workspaceDir: string, dirName) {
  const directoryId = uuidv4();
  return path.join(workspaceDir, "staging", dirName);
}

export function stageSnippet(stagingPath: string, state: State, snippetId: SnippetId) {}

function stage(stagingPath: string, relativeFilePath: string, contents: string) {}
