import { DEFAULT_ERROR_MESSAGE, ServerError } from "../../src/errors/server.error";
import { CustomError } from "../../src/errors/custom-error";

describe("ServerError", () => {
  it("should be an instance of ServerError, CustomError, and Error", () => {
    const err = new ServerError("Test");
    expect(err instanceof ServerError).toBe(true);
    expect(err instanceof Error).toBe(true);
    expect(err instanceof CustomError).toBe(true);
  });

  it("should have the correct name property", () => {
    const err = new ServerError("Test");
    expect(err.name).toBe("ServerError");
  });

  it("should have the correct message property", () => {
    const err = new ServerError("Test message");
    expect(err.message).toBe("Test message");
  });

  it("should have the default error message", () => {
    const err = new ServerError();
    expect(err.message).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it("should have the correct serializeError method", () => {
    const err = new ServerError("Test");
    expect(err.serializeError()).toEqual({ message: "Test" });
  });
});
