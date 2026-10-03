import request from 'supertest';

import app from '../src/app.js';

describe('Health API', () => {
  it('returns a safe health response', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status).toMatch(/healthy|degraded/);
    expect(response.body.database).toBeDefined();
    expect(response.body.timestamp).toBeDefined();
    expect(JSON.stringify(response.body)).not.toContain('JWT_SECRET');
  });
});
