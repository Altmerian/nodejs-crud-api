import { IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";
import { sendJsonResponse } from "../utils";

/**
 * Controller for API health check
 */
export const healthCheck = async (
  _req: IncomingMessage,
  res: ServerResponse,
  _url: URL,
): Promise<void> => {
  sendJsonResponse(res, 200, {
    status: "OK",
    message: "CRUD API server is running",
    timestamp: new Date().toISOString(),
  });
};
