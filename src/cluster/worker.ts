import { setupSharedState } from "./shared-state";
import { startServer } from "../server";
import { DEFAULT_PORT } from "../index";

/**
 * Starts a worker process that handles API requests
 */
export async function startWorker(): Promise<void> {
  const workerId = parseInt(process.env.WORKER_ID || "1", 10);
  const basePort = parseInt(process.env.PORT || DEFAULT_PORT.toString(), 10);
  const port = basePort + workerId;

  setupSharedState();

  try {
    const server = await startServer(port);
    console.log(`Worker ${process.pid} started on port ${port}`);

    process.on("SIGINT", () => {
      console.log(`Worker ${process.pid} shutting down...`);
      server.close(() => {
        console.log(`Worker ${process.pid} has shut down`);
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(`Failed to start worker: ${error}`);
    process.exit(1);
  }
}
