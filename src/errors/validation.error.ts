import { CustomError } from "./custom-error";

/**
 * Error class for validation errors (400 Bad Request)
 */
export class ValidationError extends CustomError {
  statusCode = 400;
  name = "ValidationError";

  constructor(
    message: string,
    private field?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  serializeError() {
    return {
      message: this.message,
      field: this.field,
    };
  }
}
