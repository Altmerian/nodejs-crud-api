import { startServer } from "../src/server";
import { userRepository } from "../src/domain/user/user.repository";
import { registerRoute, USER_PATH, USER_ID } from "../src/router";
import {
  healthCheck,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../src/controllers";

process.env.NODE_ENV = "test";

const TEST_PORT = 5000;

registerRoute("GET", "/", healthCheck);
registerRoute("GET", USER_PATH, getAllUsers);
registerRoute("GET", `${USER_PATH}/${USER_ID}`, getUserById);
registerRoute("POST", USER_PATH, createUser);
registerRoute("PUT", `${USER_PATH}/${USER_ID}`, updateUser);
registerRoute("DELETE", `${USER_PATH}/${USER_ID}`, deleteUser);

let server: any = null;

beforeAll(async () => {
  await userRepository.clear();
  
  try {
    server = await startServer(TEST_PORT);
    console.log(`Test server started on port ${TEST_PORT}`);
  } catch (error) {
    console.error("Failed to start test server:", error);
    throw error;
  }
});

afterAll(async () => {
  if (server) {
    server.close();
    console.log("Test server closed");
  }
}); 