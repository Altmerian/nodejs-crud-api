import http, { Server, IncomingMessage, ServerResponse } from "node:http";
import { router } from "./router";
import { ServerError } from "./errors";
import { handleError } from "./utils";

/**
 * Creates and configures an HTTP server
 * @param port The port to listen on
 * @returns The configured HTTP server instance
 */
function createServer(port: number): Server {
  const server = http.createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        console.log(`${req.method} ${req.url} (worker port ${port})`);
        await router(req, res);
      } catch (error) {
        const serverError =
          error instanceof Error
            ? new ServerError(error.message)
            : new ServerError();

        handleError(res, serverError);
      }
    },
  );

  server.on("error", (error: Error) => {
    console.error("Server error:", error.message);

    if (error.message.includes("EADDRINUSE")) {
      console.error(`Port ${port} is already in use`);
      // Don't exit if we're running tests
      if (process.env.NODE_ENV !== "test") {
        process.exit(1);
      }
    } else {
      // Don't exit if we're running tests
      if (process.env.NODE_ENV !== "test") {
        process.exit(1);
      }
    }
  });

  return server;
}

/**
 * Starts the HTTP server using the specified port
 * @param port The port number to listen on
 * @returns A promise that resolves when the server is listening
 */
export const startServer = (port: number): Promise<Server> => {
  return new Promise((resolve, reject) => {
    const server = createServer(port);

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      resolve(server);
    });

    // Set up a timeout to reject the promise if the server doesn't start
    const timeout = setTimeout(() => {
      reject(new Error(`Server failed to start within the timeout period`));
    }, 10000);

    server.once("listening", () => {
      clearTimeout(timeout);
    });

    server.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
};
