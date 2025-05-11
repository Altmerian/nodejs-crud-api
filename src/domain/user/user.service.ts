import { User, UserDto } from "./user";
import { userRepository } from "./user.repository";
import { validateUuid, validateUserData } from "./user.factory";
import { ValidationError } from "../../errors";

/**
 * User service that coordinates operations between controllers and repository
 */
export class UserService {
  private static instance: UserService;

  private constructor() {}

  /**
   * Gets singleton instance
   * @returns The single instance of UserService
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Gets all users
   * @returns Promise resolving to array of all users
   */
  async getAllUsers(): Promise<User[]> {
    return userRepository.getAll();
  }

  /**
   * Gets a user by ID
   * @param id User ID to find
   * @returns Promise resolving to the found user
   * @throws ValidationError if ID is invalid
   * @throws NotFoundError if user doesn't exist
   */
  async getUserById(id: string): Promise<User> {
    validateUuid(id);
    return userRepository.getById(id);
  }

  /**
   * Creates a new user
   * @param userData Data for user creation
   * @returns Promise resolving to the created user
   * @throws ValidationError if userData is invalid or if a user with the same username already exists
   */
  async createUser(userData: UserDto): Promise<User> {
    validateUserData(userData, true);
    
    const existingUser = await userRepository.getByUsername(userData.username!);
    if (existingUser) {
      throw new ValidationError(`User with username '${userData.username}' already exists`, 'username');
    }
    
    return userRepository.create(userData);
  }

  /**
   * Updates a user
   * @param id User ID to update
   * @param userData New user data
   * @returns Promise resolving to the updated user
   * @throws ValidationError if ID is invalid or userData is invalid
   * @throws NotFoundError if user doesn't exist
   */
  async updateUser(id: string, userData: UserDto): Promise<User> {
    validateUuid(id);
    validateUserData(userData);
    return userRepository.update(id, userData);
  }

  /**
   * Deletes a user
   * @param id User ID to delete
   * @throws ValidationError if ID is invalid
   * @throws NotFoundError if user doesn't exist
   */
  async deleteUser(id: string): Promise<void> {
    validateUuid(id);
    return userRepository.delete(id);
  }
}

// Export singleton instance
export const userService = UserService.getInstance();
