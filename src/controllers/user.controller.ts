import { IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";
import { parseRequestBody, parseUrlParams } from "../utils/request.utils";
import { sendJsonResponse, sendNoContentResponse, handleError } from "../utils/response.utils";
import { userService } from "../domain/user/user.service";
import { UserDto } from "../domain/user/user";
import { USER_PATH, USER_ID } from "../router";

/**
 * Get all users
 * @param req The incoming request
 * @param res The server response
 * @param url The parsed URL
 */
export const getAllUsers = async (
  _req: IncomingMessage,
  res: ServerResponse,
  _url: URL
): Promise<void> => {
  try {
    const users = await userService.getAllUsers();
    sendJsonResponse(res, 200, users);
  } catch (error) {
    handleError(res, error instanceof Error ? error : new Error(String(error)));
  }
};

/**
 * Get a user by ID
 * @param req The incoming request
 * @param res The server response
 * @param url The parsed URL
 */
export const getUserById = async (
  _req: IncomingMessage,
  res: ServerResponse,
  url: URL
): Promise<void> => {
  try {
    const params = parseUrlParams(url.pathname, `${USER_PATH}/${USER_ID}`);
    const userId = params.id;
    
    const user = await userService.getUserById(userId);
    sendJsonResponse(res, 200, user);
  } catch (error) {
    handleError(res, error instanceof Error ? error : new Error(String(error)));
  }
};

/**
 * Create a new user
 * @param req The incoming request
 * @param res The server response
 * @param url The parsed URL
 */
export const createUser = async (
  req: IncomingMessage,
  res: ServerResponse,
  _url: URL
): Promise<void> => {
  try {
    const userData = await parseRequestBody<UserDto>(req);
    const newUser = await userService.createUser(userData);
    sendJsonResponse(res, 201, newUser);
  } catch (error) {
    handleError(res, error instanceof Error ? error : new Error(String(error)));
  }
};

/**
 * Update a user
 * @param req The incoming request
 * @param res The server response
 * @param url The parsed URL
 */
export const updateUser = async (
  req: IncomingMessage,
  res: ServerResponse,
  url: URL
): Promise<void> => {
  try {
    const params = parseUrlParams(url.pathname, `${USER_PATH}/${USER_ID}`);
    const userId = params.id;
    const userData = await parseRequestBody<UserDto>(req);
    
    const updatedUser = await userService.updateUser(userId, userData);
    sendJsonResponse(res, 200, updatedUser);
  } catch (error) {
    handleError(res, error instanceof Error ? error : new Error(String(error)));
  }
};

/**
 * Delete a user
 * @param req The incoming request
 * @param res The server response
 * @param url The parsed URL
 */
export const deleteUser = async (
  req: IncomingMessage,
  res: ServerResponse,
  url: URL
): Promise<void> => {
  try {
    const params = parseUrlParams(url.pathname, `${USER_PATH}/${USER_ID}`);
    const userId = params.id;
    
    await userService.deleteUser(userId);
    sendNoContentResponse(res);
  } catch (error) {
    handleError(res, error instanceof Error ? error : new Error(String(error)));
  }
};
