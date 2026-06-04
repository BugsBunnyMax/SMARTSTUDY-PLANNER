const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/Task');
const User = require('../src/models/User');

describe('Task Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Create a test user and get auth token
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Task',
        lastName: 'Tester',
        email: 'tasktester@example.com',
        password: 'password123',
        matricule: 'CT23A005',
      });
    
    token = response.body.token;
    userId = response.body.user._id;
  });

  afterEach(async () => {
    // Clean up tasks after each test
    await Task.deleteMany({ userId });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Study React',
          course: 'CS101',
          dueDate: '2024-12-31',
          priority: 'high',
          estimatedDuration: 120,
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe('Study React');
      expect(response.body.status).toBe('pending');
    });

    it('should not create task without auth token', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Study React',
          course: 'CS101',
          dueDate: '2024-12-31',
        });

      expect(response.statusCode).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Missing title and dueDate
          course: 'CS101',
        });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Task 1',
          course: 'CS101',
          dueDate: '2024-12-31',
          priority: 'high',
        });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Task 2',
          course: 'CS102',
          dueDate: '2024-12-25',
          priority: 'low',
        });
    });

    it('should get all user tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.tasks).toHaveLength(2);
    });

    it('should not get tasks without auth token', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Original Title',
          course: 'CS101',
          dueDate: '2024-12-31',
        });

      taskId = response.body._id;
    });

    it('should update a task', async () => {
      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title',
          status: 'in-progress',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.status).toBe('in-progress');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Task to Delete',
          course: 'CS101',
          dueDate: '2024-12-31',
        });

      taskId = response.body._id;
    });

    it('should delete a task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(204);

      // Verify task is deleted
      const getResponse = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.statusCode).toBe(404);
    });
  });
});
