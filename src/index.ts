import { config } from "dotenv";
import { startServer } from "./server";
import { registerRoute } from "./router";
import { healthCheck } from "./controllers";

const DEFAULT_PORT = 4000;

config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;

registerRoute("GET", "/", healthCheck);

let server: any = null;

const start = async () => {
  try {
    server = await startServer(PORT);

    process.on("SIGINT", () => {
      console.log("Server shutting down...");
      if (server) {
        server.close(() => {
          console.log("Server terminated");
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
