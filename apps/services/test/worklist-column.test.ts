import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { ColumnType } from '../src/modules/worklist/entities/worklist-column.entity.js'
import {
  closeTestApp,
  createTestApp,
  createTestColumn,
  createTestWorklist,
} from './setup.js'

describe('Worklist Column API', () => {
  let app: Awaited<ReturnType<typeof createTestApp>>
  let worklistId: number

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await closeTestApp()
  })

  beforeEach(async () => {
    // await cleanupTestDatabase()
    const worklist = await createTestWorklist(app)
    worklistId = worklist.id
  })

  describe('POST /api/worklists/:id/columns', () => {
    it('should create a column', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/worklists/${worklistId}/columns`,
        payload: {
          name: 'Test Column',
          key: 'test_column',
          type: ColumnType.STRING,
          order: 1,
          properties: {
            required: true,
            description: 'Test column description',
          },
        },
      })
      const body = JSON.parse(response.body)

      expect(response.statusCode).toBe(201)
      expect(body.name).toBe('Test Column')
      expect(body.key).toBe('test_column')
      expect(body.type).toBe(ColumnType.STRING)
      expect(body.order).toBe(1)
      expect(body.properties.required).toBe(true)
    })

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/worklists/${worklistId}/columns`,
        payload: {
          name: 'Test Column',
        },
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      expect(body.message).toContain('key')
      expect(body.message).toContain('type')
      expect(body.message).toContain('order')
      expect(body.message).toContain('properties')
    })

    it('should return 404 for non-existent worklist', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/worklists/999/columns',
        payload: {
          key: 'test_column',
          type: ColumnType.STRING,
          order: 1,
          name: 'Test Column',
          properties: {
            required: true,
            description: 'Test column description',
          },
        },
      })

      expect(response.statusCode).toBe(404)
    })
  })

  describe('GET /api/worklists/:id/columns', () => {
    it('should list columns', async () => {
      await createTestColumn(app, worklistId, {
        name: 'Column 1',
        key: 'column_1',
      })
      await createTestColumn(app, worklistId, {
        name: 'Column 2',
        key: 'column_2',
      })

      const response = await app.inject({
        method: 'GET',
        url: `/api/worklists/${worklistId}/columns`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body).toHaveLength(2)
      expect(body[0].name).toBe('Column 1')
      expect(body[1].name).toBe('Column 2')
    })

    it('should return 404 for non-existent worklist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/worklists/999/columns',
      })

      expect(response.statusCode).toBe(404)
    })
  })

  describe('PUT /api/worklists/:id/columns/:columnId', () => {
    it('should update a column', async () => {
      const column = await createTestColumn(app, worklistId)

      const response = await app.inject({
        method: 'PUT',
        url: `/api/worklists/${worklistId}/columns/${column.id}`,
        payload: {
          name: 'Updated Column',
          properties: {
            required: false,
            description: 'Updated description',
          },
        },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.name).toBe('Updated Column')
      expect(body.properties.required).toBe(false)
      expect(body.properties.description).toBe('Updated description')
    })

    it('should return 404 for non-existent column', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/worklists/${worklistId}/columns/999`,
        payload: {
          name: 'Updated Column',
        },
      })

      expect(response.statusCode).toBe(404)
    })
  })

  describe('DELETE /api/worklists/:id/columns/:columnId', () => {
    it('should delete a column', async () => {
      const column = await createTestColumn(app, worklistId)

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/worklists/${worklistId}/columns/${column.id}`,
      })

      console.log(`delete output: ${response.body}`)
      expect(response.statusCode).toBe(204)

      // Verify column is deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/worklists/${worklistId}/columns`,
      })
      const body = JSON.parse(getResponse.body)
      expect(body).toHaveLength(0)
    })

    it('should return 404 for non-existent column', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/worklists/${worklistId}/columns/999`,
      })

      expect(response.statusCode).toBe(404)
    })
  })
})
