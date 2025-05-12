import cluster, { Worker } from "node:cluster";
import http from "node:http";
import { DatabaseMessage } from "./types";
import { DEFAULT_PORT } from "../index";

/**
 * Starts the master process that acts as a load balancer
 * @param numWorkers Number of worker processes to create
 */
export function startMaster(numWorkers: number): void {
  const basePort = parseInt(process.env.PORT || DEFAULT_PORT.toString(), 10);
  const workers: Array<{ worker: Worker; workerId: number }> = [];
  let currentWorkerIndex = 0;

  console.log(`Primary ${process.pid} is running`);
  console.log(`Starting ${numWorkers} workers...`);

  for (let i = 0; i < numWorkers; i++) {
    const workerId = i + 1;
    const worker = cluster.fork({ WORKER_ID: workerId });
    workers.push({ worker, workerId });

    worker.on("message", (message: DatabaseMessage) => {
      // Forward the message to all other workers
      for (const {worker: otherWorker} of workers) {
        if (otherWorker.id !== worker.id) {
          otherWorker.send(message);
        }
      }
    });
  }

  // Create load balancer on base port
  const server = http.createServer((req, res) => {
    const { worker, workerId } = workers[currentWorkerIndex];
    const workerPort = basePort + workerId;

    currentWorkerIndex = (currentWorkerIndex + 1) % workers.length;

    // Log the request routing
    console.log(`Load balancer → Worker ${workerId} (port ${workerPort})`);

    // Forward the request to the selected worker
    const options = {
      hostname: "localhost",
      port: workerPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyReq, { end: true });

    proxyReq.on("error", (error) => {
      console.error(`Error proxying request to worker ${workerId}:`, error.message);
      res.statusCode = 500;
      res.end(`Error proxying to worker: ${error.message}`);
    });
  });

  server.on("error", (error) => {
    console.error("Load balancer error:", error.message);

    if (error.message.includes("EADDRINUSE")) {
      console.error(`Port ${basePort} is already in use`);
      process.exit(1);
    } else {
      process.exit(1);
    }
  });

  server.listen(basePort, () => {
    console.log(`Load balancer running on port ${basePort}`);
  });

  // Handle worker crashes
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    
    // Find and remove the dead worker
    const index = workers.findIndex(w => w.worker.id === worker.id);
    if (index !== -1) {
      const { workerId } = workers[index];
      console.log(`Restarting worker ${workerId}...`);
      
      // Fork a new worker
      const newWorker = cluster.fork({ WORKER_ID: workerId });
      
      // Set up message handler for the new worker
      newWorker.on("message", (message: DatabaseMessage) => {
        // Forward the message to all other workers
        for (const {worker: otherWorker} of workers) {
          if (otherWorker.id !== newWorker.id) {
            otherWorker.send(message);
          }
        }
      });
      
      // Replace the dead worker in our array
      workers[index] = { worker: newWorker, workerId };
    }
  });
}
