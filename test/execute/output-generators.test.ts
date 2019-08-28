import { OutputGenerator } from "../../src/config/types";
import { OutputGenerators } from "../../src/outputs/output-generators";
import { OutputGeneratorsOptions } from "../../src/outputs/types";

describe("OutputGenerators", () => {
  const SIMPLE_COMMAND = "command";
  const SIMPLE_CONFIGS: OutputGenerator[] = [
    {
      id: "generator-id",
      command: SIMPLE_COMMAND,
      type: "console"
    }
  ];
  let generatorsOptions: OutputGeneratorsOptions;
  beforeEach(() => {
    generatorsOptions = {
      configs: SIMPLE_CONFIGS,
      stagePath: "/path/to/stage",
      /*
       * Swap out all functions that touch the operating system for running tests.
       */
      execute: jest.fn().mockReturnValue("mock-process"),
      cancel: jest.fn(),
      stage: jest.fn().mockImplementation((_, callback) => {
        callback("mock-staging-dir", null);
      })
    };
  });
  const fileContents = {
    "file-path": "Line 1"
  };

  it("runs a job", () => {
    const outputGenerators = new OutputGenerators(generatorsOptions);
    const jobId = outputGenerators.generateOutputs({ jobId: "job-id", fileContents });
    expect(jobId).toEqual("job-id");
    const executeOptions = (generatorsOptions.execute as jest.Mock).mock.calls[0][0];
    expect(executeOptions).toMatchObject({
      command: SIMPLE_COMMAND
    });
    expect(outputGenerators.jobs).toMatchObject({
      "job-id": ["mock-process"]
    });
  });

  it("returns a null job ID if no generators were run", () => {
    const outputGenerators = new OutputGenerators({ ...generatorsOptions, configs: [] });
    expect(outputGenerators.generateOutputs({ fileContents })).toBe(null);
  });

  it("runs multiple commands with multiple configs", () => {
    const configs: OutputGenerator[] = [
      {
        id: "generator-0",
        command: "command-0",
        type: "console"
      },
      {
        id: "generator-1",
        command: "command-1",
        type: "console"
      }
    ];
    const outputGenerators = new OutputGenerators({ ...generatorsOptions, configs });
    outputGenerators.generateOutputs({ fileContents });
    expect(generatorsOptions.execute).toHaveBeenCalledTimes(2);
  });

  it("skips a job if 'when' isn't satisfied", () => {
    const configs: OutputGenerator[] = [{ ...SIMPLE_CONFIGS[0], when: fileContents => false }];
    const outputGenerators = new OutputGenerators({ ...generatorsOptions, configs });
    outputGenerators.generateOutputs({ fileContents });
    expect(generatorsOptions.execute).not.toHaveBeenCalled();
  });

  it("cancels jobs", () => {
    const outputGenerators = new OutputGenerators(generatorsOptions);
    const jobId = outputGenerators.generateOutputs({ fileContents });
    outputGenerators.cancel(jobId);
    expect(generatorsOptions.cancel).toHaveBeenCalledWith(jobId);
  });
});
