import { CustomError } from "./custom-error";

export const DEFAULT_ERROR_MESSAGE = "Internal server error";

/**
 * Error class for internal server errors (500 Internal Server Error)
 */
export class ServerError extends CustomError {
  statusCode = 500;
  name = "ServerError";

  constructor(message = DEFAULT_ERROR_MESSAGE) {
    super(message);
    Object.setPrototypeOf(this, ServerError.prototype);
  }

  serializeError() {
    return {
      message: this.message,
    };
  }
}
