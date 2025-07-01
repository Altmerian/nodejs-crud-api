import { IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";
import { NotFoundError } from "./errors";
import { handleError } from "./utils";

// Type for request handlers based on HTTP method and path
type RequestHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
) => Promise<void>;

type Routes = {
  [method: string]: {
    [path: string]: RequestHandler;
  };
};

// Route registry
const routes: Routes = {
  GET: {},
  POST: {},
  PUT: {},
  DELETE: {},
};

export const USER_PATH = "/api/users";
export const USER_ID = ":id";

/**
 * Register a route handler for a specific HTTP method and path
 * @param method The HTTP method (GET, POST, PUT, DELETE)
 * @param path The request path
 * @param handler The handler function
 */
export const registerRoute = (
  method: string,
  path: string,
  handler: RequestHandler,
): void => {
  routes[method] = routes[method] || {};
  routes[method][path] = handler;
};

/**
 * Main router function to handle incoming requests
 * @param req The incoming request
 * @param res The server response
 */
export const router = async (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  try {
    const method = req.method || "GET";
    const reqUrl = req.url || "/";

    const baseUrl = `http://${req.headers.host || "localhost"}`;
    const url = new URL(reqUrl, baseUrl);

    const pathPattern = getPathPattern(url.pathname);

    const routeHandlers = routes[method];
    const handler = routeHandlers && routeHandlers[pathPattern];

    if (handler) {
      return await handler(req, res, url);
    }

    throw new NotFoundError(`Not found: ${method} ${url.pathname}`);
  } catch (error) {
    handleError(res, error instanceof Error ? error : new Error(String(error)));
  }
};

/**
 * Extract a path pattern from a URL path
 * @param path The URL path
 * @returns The matching pattern used for routing
 */
const getPathPattern = (path: string): string => {
  // Remove trailing slash if present and not root
  if (path.endsWith("/") && path !== "/") {
    path = path.slice(0, -1);
  }

  const segments = path.split("/").filter(Boolean);

  // Handle api/users and api/users/:id patterns
  if (
    segments.length >= 2 &&
    segments[0] === "api" &&
    segments[1] === "users"
  ) {
    if (segments.length === 2) {
      return USER_PATH;
    } else {
      return `${USER_PATH}/${USER_ID}`;
    }
  }

  return path || "/";
};
