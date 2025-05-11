import { userRepository } from "../../../src/domain/user/user.repository";
import { UserDto } from "../../../src/domain/user/user";
import { NotFoundError, ValidationError } from "../../../src/errors";
import { v4 as uuidv4 } from "uuid";

describe("User Repository", () => {
  beforeEach(async () => {
    await userRepository.clear();
  });

  describe("getAll", () => {
    it("should return an empty array when no users exist", async () => {
      const users = await userRepository.getAll();
      expect(users).toEqual([]);
    });

    it("should return all users when they exist", async () => {
      const user1: UserDto = {
        username: "User1",
        age: 25,
        hobbies: ["reading"],
      };

      const user2: UserDto = {
        username: "User2",
        age: 30,
        hobbies: ["gaming"],
      };

      await userRepository.create(user1);
      await userRepository.create(user2);

      const users = await userRepository.getAll();
      expect(users).toHaveLength(2);
      expect(users.map(u => u.username)).toContain("User1");
      expect(users.map(u => u.username)).toContain("User2");
    });
  });

  describe("getById", () => {
    it("should throw ValidationError for invalid UUID", async () => {
      await expect(userRepository.getById("not-a-uuid")).rejects.toThrow(ValidationError);
    });

    it("should throw NotFoundError if user doesn't exist", async () => {
      const validUuid = uuidv4();
      await expect(userRepository.getById(validUuid)).rejects.toThrow(NotFoundError);
    });

    it("should return a user if they exist", async () => {
      const userData: UserDto = {
        username: "TestUser",
        age: 25,
        hobbies: ["reading"],
      };

      const createdUser = await userRepository.create(userData);
      const retrievedUser = await userRepository.getById(createdUser.id);

      expect(retrievedUser).toEqual(createdUser);
    });
  });

  describe("create", () => {
    it("should create a new user with valid data", async () => {
      const userData: UserDto = {
        username: "NewUser",
        age: 30,
        hobbies: ["gaming", "coding"],
      };

      const user = await userRepository.create(userData);

      expect(user).toHaveProperty("id");
      expect(user.username).toBe("NewUser");
      expect(user.age).toBe(30);
      expect(user.hobbies).toEqual(["gaming", "coding"]);

      const allUsers = await userRepository.getAll();
      expect(allUsers).toContainEqual(user);
    });

    it("should throw for invalid user data", async () => {
      const invalidData: UserDto = {};
      await expect(userRepository.create(invalidData)).rejects.toThrow(ValidationError);
    });
  });

  describe("update", () => {
    it("should throw ValidationError for invalid UUID", async () => {
      const updateData: UserDto = { username: "Updated" };
      await expect(userRepository.update("not-a-uuid", updateData)).rejects.toThrow(ValidationError);
    });

    it("should throw NotFoundError if user doesn't exist", async () => {
      const validUuid = uuidv4();
      const updateData: UserDto = { username: "Updated" };
      await expect(userRepository.update(validUuid, updateData)).rejects.toThrow(NotFoundError);
    });

    it("should update a user with valid data", async () => {
      const userData: UserDto = {
        username: "OriginalName",
        age: 25,
        hobbies: ["reading"],
      };

      const createdUser = await userRepository.create(userData);
      
      const updateData: UserDto = {
        username: "UpdatedName",
        age: 30,
      };

      const updatedUser = await userRepository.update(createdUser.id, updateData);

      expect(updatedUser.id).toBe(createdUser.id);
      expect(updatedUser.username).toBe("UpdatedName");
      expect(updatedUser.age).toBe(30);
      expect(updatedUser.hobbies).toEqual(["reading"]);

      const retrievedUser = await userRepository.getById(createdUser.id);
      expect(retrievedUser).toEqual(updatedUser);
    });

    it("should throw for invalid update data", async () => {
      const userData: UserDto = {
        username: "OriginalName",
        age: 25,
        hobbies: ["reading"],
      };

      const createdUser = await userRepository.create(userData);
      
      const invalidData = {
        age: "not a number",
      };

      await expect(userRepository.update(createdUser.id, invalidData as any)).rejects.toThrow(ValidationError);
    });
  });

  describe("delete", () => {
    it("should throw ValidationError for invalid UUID", async () => {
      await expect(userRepository.delete("not-a-uuid")).rejects.toThrow(ValidationError);
    });

    it("should throw NotFoundError if user doesn't exist", async () => {
      const validUuid = uuidv4();
      await expect(userRepository.delete(validUuid)).rejects.toThrow(NotFoundError);
    });

    it("should delete a user if they exist", async () => {
      const userData: UserDto = {
        username: "ToBeDeleted",
        age: 35,
        hobbies: ["cooking"],
      };

      const createdUser = await userRepository.create(userData);
      
      let allUsers = await userRepository.getAll();
      expect(allUsers).toContainEqual(createdUser);
      
      await userRepository.delete(createdUser.id);
      
      allUsers = await userRepository.getAll();
      expect(allUsers).not.toContainEqual(createdUser);
      
      await expect(userRepository.getById(createdUser.id)).rejects.toThrow(NotFoundError);
    });
  });
});
