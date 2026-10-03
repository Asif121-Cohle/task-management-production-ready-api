import request from 'supertest';

import app from '../src/app.js';
import { clearTestDatabase, startTestDatabase, stopTestDatabase } from './testDatabase.js';

const register = async (email) => {
  const response = await request(app).post('/api/v1/auth/register').send({
    name: 'Project User',
    email,
    password: 'password123'
  });

  return response.body.data.token;
};

describe('Project API', () => {
  beforeAll(startTestDatabase);
  afterAll(stopTestDatabase);
  beforeEach(clearTestDatabase);

  it('creates and lists a project for the authenticated owner', async () => {
    const token = await register('owner@example.com');
    const created = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Learning Project', description: 'API learning' });
    const listed = await request(app)
      .get('/api/v1/projects?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(created.status).toBe(201);
    expect(listed.status).toBe(200);
    expect(listed.body.data).toHaveLength(1);
    expect(listed.body.meta.total).toBe(1);
  });

  it('prevents another user from reading or updating the project', async () => {
    const ownerToken = await register('owner@example.com');
    const otherToken = await register('other@example.com');
    const created = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Private Project' });
    const projectId = created.body.data._id;

    const read = await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    const update = await request(app)
      .put(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ name: 'Hijacked Project' });

    expect(read.status).toBe(404);
    expect(update.status).toBe(403);
  });
});
