import { ServerResponse } from "node:http";
import { CustomError } from "../errors";

/**
 * Sends a JSON response with the specified status code
 * @param res The server response object
 * @param statusCode The HTTP status code to send
 * @param data The data to send as JSON
 */
export const sendJsonResponse = (
  res: ServerResponse,
  statusCode: number,
  data: any,
): void => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

/**
 * Sends a 204 No Content response
 * @param res The server response object
 */
export const sendNoContentResponse = (res: ServerResponse): void => {
  res.writeHead(204);
  res.end();
};

/**
 * Handles errors and sends appropriate error responses
 * @param res The server response object
 * @param error The error that occurred
 */
export const handleError = (res: ServerResponse, error: Error): void => {
  console.error("Error:", error);

  if (error instanceof CustomError) {
    sendJsonResponse(res, error.statusCode, error.serializeError());
  } else {
    // For unhandled errors, send a generic 500 response
    sendJsonResponse(res, 500, {
      message: "Internal Server Error: Something went wrong",
    });
  }
};
