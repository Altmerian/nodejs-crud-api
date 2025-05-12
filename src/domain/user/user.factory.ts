import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { User, UserDto } from "./user";
import { ValidationError } from "../../errors";

/**
 * Validates if a string is a valid UUID
 * @param id ID string to validate
 * @throws ValidationError if ID is not a valid UUID
 */
export const validateUuid = (id: string): void => {
  if (!uuidValidate(id)) {
    throw new ValidationError(`Invalid UUID: ${id}`, "id");
  }
};

/**
 * Validates user data for required fields and proper types
 * @param userData User data to validate
 * @param isCreateOperation Whether this is a create operation (requiring all fields)
 * @throws ValidationError if validation fails
 */
export const validateUserData = (
  userData: UserDto,
  isCreateOperation: boolean = false,
): void => {
  // For creation, all fields are required
  if (isCreateOperation) {
    if (!userData.username) {
      throw new ValidationError("Username is required", "username");
    }

    if (userData.age === undefined) {
      throw new ValidationError("Age is required", "age");
    }

    if (!userData.hobbies) {
      throw new ValidationError("Hobbies array is required", "hobbies");
    }
  }

  // Type validation (applied for both create and update)
  if (
    userData.username !== undefined &&
    typeof userData.username !== "string"
  ) {
    throw new ValidationError("Username must be a string", "username");
  }

  if (
    userData.age !== undefined &&
    (typeof userData.age !== "number" || isNaN(userData.age))
  ) {
    throw new ValidationError("Age must be a number", "age");
  }

  if (userData.age !== undefined && userData.age <= 0) {
    throw new ValidationError("Age must be greater than 0", "age");
  }

  if (userData.hobbies !== undefined) {
    if (!Array.isArray(userData.hobbies)) {
      throw new ValidationError("Hobbies must be an array", "hobbies");
    }

    if (userData.hobbies.some((hobby) => typeof hobby !== "string")) {
      throw new ValidationError("All hobbies must be strings", "hobbies");
    }
  }
};

/**
 * Creates a new user with a generated UUID
 * @param userData User data for creation
 * @returns Created user object
 * @throws ValidationError if userData is invalid
 */
export const createUser = (userData: UserDto): User => {
  validateUserData(userData, true);

  return {
    id: uuidv4(),
    username: userData.username!,
    age: userData.age!,
    hobbies: userData.hobbies!,
  };
};

/**
 * Updates an existing user with new data
 * @param existingUser The existing user object
 * @param updateData The data to update
 * @returns Updated user object
 * @throws ValidationError if updateData is invalid
 */
export const updateUser = (existingUser: User, updateData: UserDto): User => {
  validateUserData(updateData);

  // Update only fields that are provided
  return {
    ...existingUser,
    ...(updateData.username !== undefined && { username: updateData.username }),
    ...(updateData.age !== undefined && { age: updateData.age }),
    ...(updateData.hobbies !== undefined && { hobbies: updateData.hobbies }),
  };
};
