import request from 'supertest';

import app from '../src/app.js';
import { clearTestDatabase, startTestDatabase, stopTestDatabase } from './testDatabase.js';

const user = {
  name: 'Auth User',
  email: 'auth@example.com',
  password: 'password123'
};

describe('Auth API', () => {
  beforeAll(startTestDatabase);
  afterAll(stopTestDatabase);
  beforeEach(clearTestDatabase);

  it('registers a user without returning the password', async () => {
    const response = await request(app).post('/api/v1/auth/register').send(user);

    expect(response.status).toBe(201);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.email).toBe(user.email);
    expect(response.body.data.user.password).toBeUndefined();
  });

  it('rejects duplicate email and invalid login credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(user);

    const duplicate = await request(app).post('/api/v1/auth/register').send(user);
    const invalidLogin = await request(app).post('/api/v1/auth/login').send({
      email: user.email,
      password: 'wrong-password'
    });

    expect(duplicate.status).toBe(409);
    expect(invalidLogin.status).toBe(401);
  });

  it('protects the current-user endpoint with JWT authentication', async () => {
    const missingToken = await request(app).get('/api/v1/auth/me');
    const invalidToken = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(missingToken.status).toBe(401);
    expect(invalidToken.status).toBe(401);
  });
});
