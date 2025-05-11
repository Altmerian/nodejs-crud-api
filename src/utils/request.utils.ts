import { IncomingMessage } from "node:http";
import { ValidationError } from "../errors";

/**
 * Parses the request body from the incoming message stream
 * @param req The incoming HTTP request
 * @returns Promise resolving to the parsed JSON body
 */
export const parseRequestBody = <T>(req: IncomingMessage): Promise<T> => {
  return new Promise((resolve, reject) => {
    const body: Uint8Array[] = [];

    req.on("data", (chunk: Uint8Array) => {
      body.push(chunk);
    });

    req.on("end", () => {
      if (body.length === 0) {
        return resolve({} as T);
      }

      try {
        const parsedBody = JSON.parse(Buffer.concat(body).toString());
        resolve(parsedBody as T);
      } catch (error) {
        reject(new ValidationError("Invalid JSON payload"));
      }
    });

    req.on("error", (err) => {
      reject(new ValidationError(`Error parsing request body: ${err.message}`));
    });
  });
};

/**
 * Parses URL parameters from the request URL
 * @param url The request URL
 * @param routePattern The pattern of the route with parameter placeholders (e.g., "/api/users/:id")
 * @returns An object containing the parsed parameters
 */
export const parseUrlParams = (
  url: string,
  routePattern?: string,
): { [key: string]: string } => {
  const params: { [key: string]: string } = {};

  // Remove query string if present
  const path = url.split("?")[0];

  // If a specific route pattern is provided, extract parameters based on that pattern
  if (routePattern) {
    const routeParts = routePattern.split("/");
    const urlParts = path.split("/");

    // Match each part of the URL against the route pattern
    routeParts.forEach((part, index) => {
      if (part.startsWith(":") && index < urlParts.length) {
        const paramName = part.substring(1);
        params[paramName] = urlParts[index];
      }
    });
  } else {
    const parts = path.split("/");
    if (parts.length >= 3 && parts[parts.length - 2] === "users") {
      params.userId = parts[parts.length - 1];
    }
  }

  return params;
};
