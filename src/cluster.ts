import * as dotenv from "dotenv";
import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import { startMaster } from "./cluster/master";
import { startWorker } from "./cluster/worker";

dotenv.config();

/**
 * Starts the application in cluster mode
 * Uses the Node.js Cluster API to create multiple worker processes
 * Primary process acts as a load balancer with Round-robin algorithm
 */
export async function startCluster(): Promise<void> {
  const numCPUs = Math.max(1, availableParallelism() - 1);

  if (cluster.isPrimary) {
    startMaster(numCPUs);
  } else {
    await startWorker();
  }
}

if (require.main === module) {
  startCluster().catch((error) => {
    console.error("Failed to start cluster:", error);
    process.exit(1);
  });
}
