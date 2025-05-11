/**
 * User entity interface
 */
export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

/**
 * Data transfer object for user creation and update operations
 */
export interface UserDto {
  username?: string;
  age?: number;
  hobbies?: string[];
}
