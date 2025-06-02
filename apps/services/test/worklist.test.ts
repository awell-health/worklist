import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { Worklist } from '../src/modules/worklist/entities/worklist.entity.js'
import {
  cleanupTestDatabase,
  closeTestApp,
  createTestApp,
  createTestWorklist,
  testTenantId,
  testUserId,
} from './setup.js'

describe('Worklist API', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await closeTestApp()
  })

  beforeEach(async () => {
    await cleanupTestDatabase()
  })

  describe('POST /api/worklists', () => {
    it('should create a worklist', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/worklists',
        payload: {
          name: 'Test Worklist',
          description: 'Test Description',
          tenantId: testTenantId,
          userId: testUserId,
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.name).toBe('Test Worklist')
      expect(body.description).toBe('Test Description')
      // expect(body.tenantId).toBe(testTenantId);
      // expect(body.userId).toBe(testUserId);
    })

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/worklists',
        payload: {
          description: 'Test Description',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.message).toContain('name')
    })
  })

  describe('GET /api/worklists', () => {
    it('should list worklists', async () => {
      // Create test worklists
      await createTestWorklist(app, { name: 'Worklist 1' })
      await createTestWorklist(app, { name: 'Worklist 2' })

      const response = await app.inject({
        method: 'GET',
        url: '/api/worklists',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body).toHaveLength(2)
      expect(body.find((w: Worklist) => w.name === 'Worklist 1')).toBeDefined()
      expect(body.find((w: Worklist) => w.name === 'Worklist 2')).toBeDefined()
    })
  })

  describe('GET /api/worklists/:id', () => {
    it('should get a worklist by id', async () => {
      const worklist = await createTestWorklist(app, { name: 'Test Worklist' })

      const response = await app.inject({
        method: 'GET',
        url: `/api/worklists/${worklist.id}`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.id).toBe(worklist.id)
      expect(body.name).toBe('Test Worklist')
    })

    it('should return 404 for non-existent worklist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/worklists/999',
      })

      expect(response.statusCode).toBe(404)
    })
  })

  describe('PUT /api/worklists/:id', () => {
    it('should update a worklist', async () => {
      const worklist = await createTestWorklist(app, { name: 'Original Name' })

      const response = await app.inject({
        method: 'PUT',
        url: `/api/worklists/${worklist.id}`,
        payload: {
          name: 'Updated Name',
          description: 'Updated Description',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.name).toBe('Updated Name')
      expect(body.description).toBe('Updated Description')
    })

    it('should return 404 for non-existent worklist', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/worklists/999',
        payload: {
          name: 'Updated Name',
        },
      })

      expect(response.statusCode).toBe(404)
    })
  })

  describe('DELETE /api/worklists/:id', () => {
    it('should delete a worklist', async () => {
      const worklist = await createTestWorklist(app)

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/worklists/${worklist.id}`,
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body)).toEqual({ success: true })

      // Verify worklist is deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/worklists/${worklist.id}`,
      })
      expect(getResponse.statusCode).toBe(404)
    })

    it('should return 404 for non-existent worklist', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/worklists/999',
      })

      expect(response.statusCode).toBe(404)
    })
  })
})
