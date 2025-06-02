import type { FastifyInstance } from 'fastify'
import { createApp } from '../src/app.js'
import { WorklistColumn } from '../src/modules/worklist/entities/worklist-column.entity.js'
// import { MikroORM } from '@mikro-orm/core';
// import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Worklist } from '../src/modules/worklist/entities/worklist.entity.js'

let app: FastifyInstance
// let orm: MikroORM;

export async function createTestApp(): Promise<FastifyInstance> {
  if (app) return app

  // Create Fastify app
  app = await createApp()

  // Create schema
  // await app.store.orm.schema.clearDatabase({ truncate: true })
  // await app.store.orm.schema.refreshDatabase({ dropDb: true, ensureIndexes: true, create: true });

  // Add orm to app
  //   app.decorate('orm', orm);

  return app
}

export async function cleanupTestDatabase() {
  if (app) {
    const em = app.store.orm.em.fork()
    await em.nativeDelete(WorklistColumn, {})
    await em.nativeDelete(Worklist, {})
    await em.flush()
  }
}

export async function closeTestApp() {
  if (app) {
    await app.store.orm.close()
  }
  if (app) {
    await app.close()
  }
}

// Test data helpers
export const testTenantId = 'test-tenant-123'
export const testUserId = 'test-user-123'

export async function createTestWorklist(
  app: FastifyInstance,
  data: Partial<Worklist> = {},
) {
  const em = app.store.orm.em.fork()
  const now = new Date()
  const worklist = em.create(Worklist, {
    name: 'Test Worklist',
    description: 'Test Description',
    tenantId: '',
    // tenantId: testTenantId,
    // userId: testUserId,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    ...data,
  })
  await em.persistAndFlush(worklist)
  return worklist
}

export async function createTestColumn(
  app: FastifyInstance,
  worklistId: number,
  data: Partial<WorklistColumn> = {},
) {
  const em = app.store.orm.em.fork()
  const worklist = await em.findOne(Worklist, { id: worklistId })
  if (!worklist) throw new Error('Worklist not found')

  const column = em.create(WorklistColumn, {
    name: 'Test Column',
    key: 'test_column',
    type: 'string',
    order: 1,
    properties: {
      required: true,
      description: 'Test column description',
    },
    metadata: data.metadata || {},
    worklist,
    ...data,
  })
  await em.persistAndFlush(column)
  return column
}
