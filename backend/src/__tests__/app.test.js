const request = require('supertest');
const app = require('../app');

describe('Backend App', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'Server is running');
    expect(response.body).toHaveProperty('timestamp');
  });
});
