import { IncomingMessage } from "node:http";
import { ValidationError } from "../errors";

/**
 * Parses the request body from the incoming message stream
 * @param req The incoming HTTP request
 * @returns Promise resolving to the parsed JSON body
 */
export const parseRequestBody = <T>(req: IncomingMessage): Promise<T> => {
  return new Promise((resolve, reject) => {
    const body: Uint8Array[] = [];
    
    req.on("data", (chunk: Uint8Array) => {
      body.push(chunk);
    });
    
    req.on("end", () => {
      if (body.length === 0) {
        return resolve({} as T);
      }
      
      try {
        const parsedBody = JSON.parse(Buffer.concat(body).toString());
        resolve(parsedBody as T);
      } catch (error) {
        reject(new ValidationError("Invalid JSON payload"));
      }
    });
    
    req.on("error", (err) => {
      reject(new ValidationError(`Error parsing request body: ${err.message}`));
    });
  });
};

/**
 * Parses URL parameters from the request URL
 * @param url The request URL
 * @returns An object containing the parsed parameters
 */
export const parseUrlParams = (url: string): { [key: string]: string } => {
  const params: { [key: string]: string } = {};
  
  // Extract path parameters from URL with pattern /resource/:param
  // This is a simple implementation and should be expanded as needed
  const parts = url.split("/");
  if (parts.length >= 3 && parts[parts.length - 2] === "users") {
    params.userId = parts[parts.length - 1];
  }
  
  return params;
};
