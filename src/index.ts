import { config } from "dotenv";
import { startServer } from "./server";
import { registerRoute, USER_PATH, USER_ID } from "./router";
import { 
  healthCheck, 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from "./controllers";

const DEFAULT_PORT = 4000;

config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;

registerRoute("GET", "/", healthCheck);
registerRoute("GET", USER_PATH, getAllUsers);
registerRoute("GET", `${USER_PATH}/${USER_ID}`, getUserById);
registerRoute("POST", USER_PATH, createUser);
registerRoute("PUT", `${USER_PATH}/${USER_ID}`, updateUser);
registerRoute("DELETE", `${USER_PATH}/${USER_ID}`, deleteUser);

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
