import request from 'supertest';

import app from '../src/app.js';
import { clearTestDatabase, startTestDatabase, stopTestDatabase } from './testDatabase.js';

const register = async (email) => {
  const response = await request(app).post('/api/v1/auth/register').send({
    name: 'Task User',
    email,
    password: 'password123'
  });

  return {
    token: response.body.data.token,
    id: response.body.data.user.id
  };
};

describe('Task API', () => {
  beforeAll(startTestDatabase);
  afterAll(stopTestDatabase);
  beforeEach(clearTestDatabase);

  it('creates, filters, updates, changes status, and assigns a task', async () => {
    const owner = await register('owner@example.com');
    const member = await register('member@example.com');
    const project = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Task Project' });
    const projectId = project.body.data._id;

    await request(app)
      .post(`/api/v1/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ userId: member.id });

    const created = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        title: 'Ship API',
        project: projectId,
        priority: 'high'
      });
    const taskId = created.body.data._id;

    const filtered = await request(app)
      .get('/api/v1/tasks?priority=high&page=1&limit=10')
      .set('Authorization', `Bearer ${owner.token}`);
    const status = await request(app)
      .patch(`/api/v1/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'completed' });
    const assigned = await request(app)
      .patch(`/api/v1/tasks/${taskId}/assign`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ userId: member.id });
    const updated = await request(app)
      .put(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Ship production API' });

    expect(created.status).toBe(201);
    expect(filtered.body.data).toHaveLength(1);
    expect(status.body.data.status).toBe('completed');
    expect(assigned.body.data.assignedTo._id).toBe(member.id);
    expect(updated.body.data.title).toBe('Ship production API');
  });

  it('prevents users outside a project from reading its tasks', async () => {
    const owner = await register('owner@example.com');
    const outsider = await register('outsider@example.com');
    const project = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Private Task Project' });
    const task = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Private Task', project: project.body.data._id });

    const response = await request(app)
      .get(`/api/v1/tasks/${task.body.data._id}`)
      .set('Authorization', `Bearer ${outsider.token}`);

    expect(response.status).toBe(404);
  });
});
