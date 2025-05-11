/**
 * Base custom error class that other custom error types will extend
 */
export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
    // Set the prototype explicitly to make instanceof work correctly
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  /**
   * Serializes the error for the response
   */
  abstract serializeError(): { message: string; field?: string };
}
