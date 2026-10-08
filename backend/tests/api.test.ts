import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5000/api';

describe('PulseFlow Backend Integration & Security Tests', () => {
  let authToken = '';
  let testProjectId = '';
  let testTaskId = '';
  const testEmail = `test_${Date.now()}@pulseflow.io`;

  it('1. GET /api/health should return UP status', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.status, 'UP');
  });

  it('2. POST /api/auth/register should create new user and return JWT', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Developer',
        email: testEmail,
        password: 'securePassword123',
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.email, testEmail);
    authToken = data.token;
  });

  it('3. POST /api/auth/register with duplicate email should be rejected (409)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Duplicate User',
        email: testEmail,
        password: 'anotherPassword',
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 409);
    assert.equal(data.success, false);
  });

  it('4. POST /api/auth/login with valid credentials should succeed', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securePassword123',
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok(data.token);
  });

  it('5. POST /api/auth/login with wrong password should fail (401)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongPassword',
      }),
    });
    assert.equal(res.status, 401);
  });

  it('6. GET /api/projects without token should be unauthorized (401)', async () => {
    const res = await fetch(`${BASE_URL}/projects`);
    assert.equal(res.status, 401);
  });

  it('7. POST /api/projects should create project with authenticated user', async () => {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: 'Automated Test Project',
        description: 'Created during test run',
        status: 'IN_PROGRESS',
        startDate: '2026-10-01',
        endDate: '2026-11-01',
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.name, 'Automated Test Project');
    testProjectId = data.data.id;
  });

  it('8. POST /api/tasks should create task under project', async () => {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: 'Automated Task #1',
        description: 'Verify task creation',
        priority: 'HIGH',
        status: 'PENDING',
        projectId: testProjectId,
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.name, 'Automated Task #1');
    testTaskId = data.data.id;
  });

  it('9. PUT /api/tasks/:id should update task status to COMPLETED', async () => {
    const res = await fetch(`${BASE_URL}/tasks/${testTaskId}`, {
      method: 'POST', // or PUT
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        status: 'COMPLETED',
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.data.status, 'COMPLETED');
  });

  it('10. GET /api/dashboard should return metrics reflecting new project and task', async () => {
    const res = await fetch(`${BASE_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok(data.data.totalProjects >= 1);
    assert.ok(data.data.totalTasks >= 1);
    assert.ok(data.data.completedTasks >= 1);
  });
});

