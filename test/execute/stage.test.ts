import * as fs from "fs";
import mock from "mock-fs";
import * as path from "path";
import { stage } from "../../src/outputs/stage";

describe("stage", () => {
  const BASE_STAGING_PATH = "/path/to/stage";

  beforeEach(() => {
    mock({
      [BASE_STAGING_PATH]: {}
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it("stages files", done => {
    const fileContents = {
      "file0.txt": "File 0 content",
      "file1.txt": "File 1 content"
    };
    stage(BASE_STAGING_PATH, fileContents, stageDir => {
      expect(stageDir).toMatch(new RegExp("^" + BASE_STAGING_PATH));
      expect(fs.readFileSync(path.join(stageDir, "file0.txt")).toString()).toEqual(
        "File 0 content"
      );
      done();
    });
  });
});
