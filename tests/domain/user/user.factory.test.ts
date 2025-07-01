import { createUser, updateUser, validateUserData, validateUuid } from "../../../src/domain/user/user.factory";
import { User, UserDto } from "../../../src/domain/user/user";
import { ValidationError } from "../../../src/errors";

describe("User Factory", () => {
  describe("validateUuid", () => {
    it("should not throw for valid UUID", () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      expect(() => validateUuid(validUuid)).not.toThrow();
    });

    it("should throw ValidationError for invalid UUID", () => {
      const invalidUuid = "not-a-uuid";
      expect(() => validateUuid(invalidUuid)).toThrow(ValidationError);
      expect(() => validateUuid(invalidUuid)).toThrow("Invalid UUID");
    });
  });

  describe("validateUserData", () => {
    it("should validate user data correctly for creation", () => {
      const validData: UserDto = {
        username: "John",
        age: 25,
        hobbies: ["reading", "cycling"],
      };

      // Should not throw an error
      expect(() => validateUserData(validData, true)).not.toThrow();
    });

    it("should throw error for missing username on creation", () => {
      const invalidData: UserDto = {
        age: 25,
        hobbies: ["reading"],
      };

      expect(() => validateUserData(invalidData, true)).toThrow(ValidationError);
      expect(() => validateUserData(invalidData, true)).toThrow("Username is required");
    });

    it("should throw error for missing age on creation", () => {
      const invalidData: UserDto = {
        username: "John",
        hobbies: ["reading"],
      };

      expect(() => validateUserData(invalidData, true)).toThrow(ValidationError);
      expect(() => validateUserData(invalidData, true)).toThrow("Age is required");
    });

    it("should throw error for missing hobbies on creation", () => {
      const invalidData: UserDto = {
        username: "John",
        age: 25,
      };

      expect(() => validateUserData(invalidData, true)).toThrow(ValidationError);
      expect(() => validateUserData(invalidData, true)).toThrow("Hobbies array is required");
    });

    it("should throw error for invalid username type", () => {
      const invalidData = {
        username: 123,
        age: 25,
        hobbies: ["reading"],
      };

      expect(() => validateUserData(invalidData as any, true)).toThrow(ValidationError);
      expect(() => validateUserData(invalidData as any, true)).toThrow("Username must be a string");
    });

    it("should throw error for invalid age type", () => {
      const invalidData = {
        username: "John",
        age: "25",
        hobbies: ["reading"],
      };

      expect(() => validateUserData(invalidData as any, true)).toThrow(ValidationError);
      expect(() => validateUserData(invalidData as any, true)).toThrow("Age must be a number");
    });

    it("should throw error for age less than or equal to 0", () => {
      const zeroAgeData = {
        username: "John",
        age: 0,
        hobbies: ["reading"],
      };

      expect(() => validateUserData(zeroAgeData, true)).toThrow(ValidationError);
      expect(() => validateUserData(zeroAgeData, true)).toThrow("Age must be greater than 0");

      const negativeAgeData = {
        username: "John",
        age: -5,
        hobbies: ["reading"],
      };

      expect(() => validateUserData(negativeAgeData, true)).toThrow(ValidationError);
      expect(() => validateUserData(negativeAgeData, true)).toThrow("Age must be greater than 0");
    });

    it("should throw error for invalid hobbies type", () => {
      const invalidData = {
        username: "John",
        age: 25,
        hobbies: "reading",
      };

      expect(() => validateUserData(invalidData as any, true)).toThrow(ValidationError);
      expect(() => validateUserData(invalidData as any, true)).toThrow("Hobbies must be an array");
    });

    it("should throw error for non-string hobbies", () => {
      const invalidData = {
        username: "John",
        age: 25,
        hobbies: ["reading", 123],
      };

      expect(() => validateUserData(invalidData as any, true)).toThrow(ValidationError);
      expect(() => validateUserData(invalidData as any, true)).toThrow("All hobbies must be strings");
    });

    it("should not require all fields for updates", () => {
      const partialData: UserDto = {
        age: 30,
      };

      // Should not throw for partial data in update mode
      expect(() => validateUserData(partialData)).not.toThrow();
    });
  });

  describe("createUser", () => {
    it("should create a user with valid data", () => {
      const userData: UserDto = {
        username: "John",
        age: 25,
        hobbies: ["reading", "cycling"],
      };

      const user = createUser(userData);

      expect(user).toHaveProperty("id");
      expect(typeof user.id).toBe("string");
      expect(user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/); // UUID format
      expect(user.username).toBe("John");
      expect(user.age).toBe(25);
      expect(user.hobbies).toEqual(["reading", "cycling"]);
    });

    it("should throw for invalid user data", () => {
      const invalidData: UserDto = {};

      expect(() => createUser(invalidData)).toThrow(ValidationError);
    });
  });

  describe("updateUser", () => {
    it("should update a user correctly", () => {
      const existingUser: User = {
        id: "12345678-1234-1234-1234-123456789012",
        username: "John",
        age: 25,
        hobbies: ["reading", "cycling"],
      };

      const updateData: UserDto = {
        username: "John Doe",
        age: 30,
      };

      const updatedUser = updateUser(existingUser, updateData);

      expect(updatedUser.id).toBe(existingUser.id);
      expect(updatedUser.username).toBe("John Doe");
      expect(updatedUser.age).toBe(30);
      expect(updatedUser.hobbies).toEqual(["reading", "cycling"]);
    });

    it("should only update provided fields", () => {
      const existingUser: User = {
        id: "12345678-1234-1234-1234-123456789012",
        username: "John",
        age: 25,
        hobbies: ["reading", "cycling"],
      };

      const updateData: UserDto = {
        hobbies: ["gaming", "swimming"],
      };

      const updatedUser = updateUser(existingUser, updateData);

      expect(updatedUser.id).toBe(existingUser.id);
      expect(updatedUser.username).toBe("John");
      expect(updatedUser.age).toBe(25);
      expect(updatedUser.hobbies).toEqual(["gaming", "swimming"]);
    });

    it("should throw for invalid update data", () => {
      const existingUser: User = {
        id: "12345678-1234-1234-1234-123456789012",
        username: "John",
        age: 25,
        hobbies: ["reading", "cycling"],
      };

      const invalidData = {
        age: "not a number",
      };

      expect(() => updateUser(existingUser, invalidData as any)).toThrow(ValidationError);
    });
  });
});
