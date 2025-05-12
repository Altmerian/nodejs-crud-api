import http from 'node:http';

const HOST = 'localhost';
const PORT = 5000;
const BASE_PATH = '/api/users';

const testUser = {
  username: "John Doe",
  age: 30,
  hobbies: ["reading", "cycling"]
};

const updateData = {
  username: "Jane Doe",
  hobbies: ["reading", "cycling", "swimming"]
};

// Helper function for making HTTP requests
function request(method: string, path: string, data: any = null): Promise<{ statusCode: number, body: any }> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const statusCode = res.statusCode || 0;
          
          // For DELETE with 204 No Content or empty responses
          const parsedBody = responseBody ? JSON.parse(responseBody) : null;
          
          resolve({ statusCode, body: parsedBody });
        } catch (error) {
          reject(new Error(`Error parsing response: ${error instanceof Error ? error.message : String(error)}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}


describe('CRUD API Integration Tests', () => {
  let userId: string;

  beforeAll(async () => {
    try {
      const response = await request('GET', BASE_PATH);
      
      if (response.body && Array.isArray(response.body)) {
        for (const user of response.body) {
          if (user.id) {
            await request('DELETE', `${BASE_PATH}/${user.id}`);
          }
        }
      }
    } catch (error) {
      console.error('Error clearing users:', error);
    }
  });

  // GET all users (should be empty at first)
  test('should return empty array when getting all users initially', async () => {
    const response = await request('GET', BASE_PATH);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Create a user
  test('should create a new user', async () => {
    const response = await request('POST', BASE_PATH, testUser);
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(testUser.username);
    expect(response.body.age).toBe(testUser.age);
    expect(response.body.hobbies).toEqual(testUser.hobbies);
    
    // Save the user ID for later tests
    userId = response.body.id;
  });

  // Try to create another user with the same username
  test('should reject duplicate username creation', async () => {
    const duplicateResponse = await request('POST', BASE_PATH, testUser);
    
    expect(duplicateResponse.statusCode).toBe(400);
    expect(duplicateResponse.body).toHaveProperty('message');
    expect(duplicateResponse.body.message).toContain('already exists');
    
    const uppercaseUser = {
      username: testUser.username.toUpperCase(),
      age: 25,
      hobbies: ["swimming"]
    };
    
    const caseInsensitiveResponse = await request('POST', BASE_PATH, uppercaseUser);
    expect(caseInsensitiveResponse.statusCode).toBe(400);
    expect(caseInsensitiveResponse.body).toHaveProperty('message');
    expect(caseInsensitiveResponse.body.message).toContain('already exists');
  });

  // Get the created user by ID
  test('should get a user by ID', async () => {
    const response = await request('GET', `${BASE_PATH}/${userId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', userId);
    expect(response.body.username).toBe(testUser.username);
    expect(response.body.age).toBe(testUser.age);
    expect(response.body.hobbies).toEqual(testUser.hobbies);
  });

  // Update the user
  test('should update a user', async () => {
    const response = await request('PUT', `${BASE_PATH}/${userId}`, updateData);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', userId);
    expect(response.body.username).toBe(updateData.username);
    // Age should remain unchanged as it wasn't in updateData
    expect(response.body.age).toBe(testUser.age);
    expect(response.body.hobbies).toEqual(updateData.hobbies);
  });

  // Get all users (should contain our updated user)
  test('should get all users including updated user', async () => {
    const response = await request('GET', BASE_PATH);
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    
    const user = response.body[0];
    expect(user).toHaveProperty('id', userId);
    expect(user.username).toBe(updateData.username);
    expect(user.age).toBe(testUser.age);
    expect(user.hobbies).toEqual(updateData.hobbies);
  });

  // Delete the user
  test('should delete a user', async () => {
    const response = await request('DELETE', `${BASE_PATH}/${userId}`);
    
    expect(response.statusCode).toBe(204);
    expect(response.body).toBeNull();
  });

  // Try to get the deleted user (should return 404)
  test('should return 404 when getting deleted user', async () => {
    const response = await request('GET', `${BASE_PATH}/${userId}`);
    
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain(userId);
  });

  // Invalid UUID
  test('should return 400 for invalid UUID', async () => {
    const invalidId = 'not-a-uuid';
    const response = await request('GET', `${BASE_PATH}/${invalidId}`);
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Invalid UUID');
  });

  // Invalid user data
  test('should return 400 for invalid user data', async () => {
    const invalidUser = {
      username: 123,
      age: "thirty",
      hobbies: "reading"
    };
    
    const response = await request('POST', BASE_PATH, invalidUser);
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('message');
  });
});
