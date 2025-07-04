import { User, UserDto } from "./user";
import { createUser, updateUser, validateUuid } from "./user.factory";
import { NotFoundError } from "../../errors";

/**
 * In-memory repository for user data access
 * Implements the singleton pattern for consistent data access
 */
class UserRepository {
  private static instance: UserRepository;
  private users: Map<string, User>;

  private constructor() {
    this.users = new Map<string, User>();
  }

  /**
   * Gets singleton instance
   * @returns The single instance of UserRepository
   */
  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  /**
   * Gets a user by ID
   * @param id User ID (UUID)
   * @returns The user if found
   * @throws ValidationError if ID is invalid
   * @throws NotFoundError if user doesn't exist
   */
  async getById(id: string): Promise<User> {
    validateUuid(id);

    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    return user;
  }

  /**
   * Gets all users
   * @returns Array of all users
   */
  async getAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  /**
   * Gets a user by username (case-insensitive)
   * @param username Username to search for
   * @returns The user if found, null otherwise
   */
  async getByUsername(username: string): Promise<User | null> {
    const lowercaseUsername = username.toLowerCase();

    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === lowercaseUsername) {
        return user;
      }
    }

    return null;
  }

  /**
   * Creates a new user
   * @param userData Data for new user
   * @returns The created user
   */
  async create(userData: UserDto): Promise<User> {
    const newUser = createUser(userData);
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  /**
   * Updates a user by ID
   * @param id User ID (UUID)
   * @param userData New user data
   * @returns The updated user
   * @throws ValidationError if ID is invalid
   * @throws NotFoundError if user doesn't exist
   */
  async update(id: string, userData: UserDto): Promise<User> {
    const existingUser = await this.getById(id);
    const updatedUser = updateUser(existingUser, userData);

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  /**
   * Deletes a user by ID
   * @param id User ID (UUID)
   * @throws ValidationError if ID is invalid
   * @throws NotFoundError if user doesn't exist
   */
  async delete(id: string): Promise<void> {
    await this.getById(id); // This checks if user exists and validates UUID
    this.users.delete(id);
  }

  /**
   * Clears all users from the repository (mainly for testing)
   */
  async clear(): Promise<void> {
    this.users.clear();
  }

  /**
   * Sets a user directly in the repository - used for syncing between processes
   * @param user The user object to set
   */
  syncUser(user: User): void {
    validateUuid(user.id);
    this.users.set(user.id, user);
  }

  /**
   * Replaces the entire users collection - for complete synchronization
   * @param users Array of users to set
   */
  syncAllUsers(users: User[]): void {
    this.users.clear();
    
    for (const user of users) {
      validateUuid(user.id);
      this.users.set(user.id, user);
    }
  }
  
  /**
   * Gets a snapshot of all users for synchronization
   * @returns The entire users collection as an array
   */
  getAllUsersSnapshot(): User[] {
    return Array.from(this.users.values());
  }
}

// Export singleton instance
export const userRepository = UserRepository.getInstance();
