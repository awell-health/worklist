import fp from 'fastify-plugin';
import { MikroORM, type SqlEntityManager, type Options, type EntityRepository } from '@mikro-orm/postgresql';
import { Worklist } from "@/modules/worklist/entities/worklist.entity.js";
import config from '@/model/orm.config.js';
import { WorklistColumn } from '@/modules/worklist/entities/worklist-column.entity.js';

type SeverDataSoreOptions = {
  forkOnRequest?: boolean
}

type DataStorePluginOptions = Options & SeverDataSoreOptions;

export interface DataStore {
  orm: MikroORM;
  em: SqlEntityManager;
  worklist: EntityRepository<Worklist>;
  worklistColumn: EntityRepository<WorklistColumn>;
}

export default fp<DataStorePluginOptions>(async (fastify, options) => {
  if (options.forkOnRequest === undefined) {
    options.forkOnRequest = true
  }

  const dataStoreGenerator = (orm: MikroORM) => ({
    orm,
    em: orm.em as SqlEntityManager,
    worklist: orm.em.getRepository(Worklist),
    worklistColumn: orm.em.getRepository(WorklistColumn),
  });

  const orm = await MikroORM.init(Object.assign({}, options, config));
  const mikroORM = dataStoreGenerator(orm);
  fastify.decorate('store', mikroORM)

  if (options.forkOnRequest) {
    fastify.addHook('onRequest', async function (this: typeof fastify, request, reply) {
      const orm = Object.assign({}, this.store.orm);
      orm.em = orm.em.fork();

      request.store = dataStoreGenerator(orm as MikroORM);
    })
  } else {
    fastify.addHook('onRequest', async function (this: typeof fastify, request, reply) {
      request.store = this.store
    })
  }

  fastify.addHook('onClose', () => orm.close())
}, {
  name: 'model',
  dependencies: ['configuration'],
});

declare module 'fastify' {
  interface FastifyInstance {
    store: DataStore
  }
  interface FastifyRequest {
    store: DataStore
  }
}