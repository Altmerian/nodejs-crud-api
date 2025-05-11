import { CustomError } from "./custom-error";

/**
 * Error class for resources that are not found (404 Not Found)
 */
export class NotFoundError extends CustomError {
  statusCode = 404;
  name = "NotFoundError";

  constructor(message = "Resource not found") {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeError() {
    return {
      message: this.message,
    };
  }
}
