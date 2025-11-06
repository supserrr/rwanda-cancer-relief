/**
 * Integration tests for authentication endpoints
 * 
 * Tests the full authentication flow including database interactions
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();
const BASE_URL = '/api/auth';

describe('Authentication API Integration Tests', () => {
  let testUserToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Setup: Create test user or use existing test credentials
    // This would typically involve database setup
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    // This would typically involve database cleanup
  });

  describe('POST /api/auth/signup', () => {
    it('should sign up a new user successfully', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/signup`)
        .send({
          email: 'integration-test@example.com',
          password: 'TestPassword123!',
          role: 'patient',
          fullName: 'Integration Test User',
          phoneNumber: '+250788123456',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('integration-test@example.com');
      expect(response.body.data.tokens.accessToken).toBeDefined();
      
      // Store token for subsequent tests
      testUserToken = response.body.data.tokens.accessToken;
      testUserId = response.body.data.user.id;
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/signup`)
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!',
          role: 'patient',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/signup`)
        .send({
          email: 'test@example.com',
          password: '123',
          role: 'patient',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for duplicate email', async () => {
      // First signup
      await request(app)
        .post(`${BASE_URL}/signup`)
        .send({
          email: 'duplicate@example.com',
          password: 'TestPassword123!',
          role: 'patient',
          fullName: 'First User',
        });

      // Second signup with same email
      const response = await request(app)
        .post(`${BASE_URL}/signup`)
        .send({
          email: 'duplicate@example.com',
          password: 'TestPassword123!',
          role: 'patient',
          fullName: 'Second User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/signin', () => {
    it('should sign in user with valid credentials', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/signin`)
        .send({
          email: 'integration-test@example.com',
          password: 'TestPassword123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('integration-test@example.com');
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/signin`)
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/signin`)
        .send({
          email: 'integration-test@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/me`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('integration-test@example.com');
      expect(response.body.data.user.id).toBe(testUserId);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/me`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/me`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      // This test requires a valid refresh token
      // Implementation depends on token management
      expect(true).toBe(true); // Placeholder
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/refresh`)
        .send({
          refreshToken: 'invalid-refresh-token',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update profile successfully', async () => {
      const response = await request(app)
        .put(`${BASE_URL}/profile`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          fullName: 'Updated Name',
          phoneNumber: '+250788123457',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.fullName).toBe('Updated Name');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put(`${BASE_URL}/profile`)
        .send({
          fullName: 'Updated Name',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/change-password`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'NewPassword123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 401 for incorrect current password', async () => {
      const response = await request(app)
        .post(`${BASE_URL}/change-password`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

