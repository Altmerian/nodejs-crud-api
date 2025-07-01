import { userRepository } from "../domain/user/user.repository";
import { User, UserDto } from "../domain/user/user";
import { DatabaseMessage } from "./types";

/**
 * Sets up user.repository state synchronization between worker processes
 * Using the "monkey patching" approach to override original object methods
 */
export function setupSharedState(): void {
  const originalCreate = userRepository.create.bind(userRepository);
  const originalUpdate = userRepository.update.bind(userRepository);
  const originalDelete = userRepository.delete.bind(userRepository);

  // Perform initial sync when worker starts
  process.send?.({ type: "SYNC_ALL", payload: null });

  userRepository.create = async (userData: UserDto): Promise<User> => {
    const user = await originalCreate(userData);
    const message: DatabaseMessage = {
      type: "USER_CREATED",
      payload: user,
    };
    process.send?.(message);
    return user;
  };

  userRepository.update = async (id: string, userData: UserDto): Promise<User> => {
    const user = await originalUpdate(id, userData);
    const message: DatabaseMessage = {
      type: "USER_UPDATED",
      payload: user,
    };
    process.send?.(message);
    return user;
  };

  userRepository.delete = async (id: string): Promise<void> => {
    await originalDelete(id);
    const message: DatabaseMessage = {
      type: "USER_DELETED",
      payload: id,
    };
    process.send?.(message);
  };

  process.on("message", async (message: DatabaseMessage) => {
    try {
      switch (message.type) {
        case "USER_CREATED":
          userRepository.syncUser(message.payload);
          break;
        case "USER_UPDATED":
          userRepository.syncUser(message.payload);
          break;
        case "USER_DELETED":
          await originalDelete(message.payload);
          break;
        case "SYNC_ALL":
          // If this is a sync request, send back all users
          if (message.payload === null) {
            const allUsers = userRepository.getAllUsersSnapshot();
            process.send?.({ type: "SYNC_ALL", payload: allUsers });
          } 
          // If this is a sync response, update all users
          else if (Array.isArray(message.payload)) {
            userRepository.syncAllUsers(message.payload);
          }
          break;
      }
    } catch (error) {
      console.error(`Error handling sync message ${message.type}:`, error);
    }
  });
}
