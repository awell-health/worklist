import fp from "fastify-plugin";
import { list } from "./routes/list.js";
import { get } from "./routes/get.js";
import { create } from "./routes/create.js";
import { update } from "./routes/update.js";
import { deleteWorklist } from "./routes/delete.js";
import { columnCreate } from './routes/column-create.js'
import { columnUpdate } from "./routes/column-update.js";
import { columnDelete } from "./routes/column-delete.js";
import { columnList } from "./routes/column-list.js";


export default fp(async (fastify) => {
  fastify.register(list, { prefix: 'api' });
  fastify.register(get, { prefix: 'api' });
  fastify.register(create, { prefix: 'api' });
  fastify.register(update, { prefix: 'api' });
  fastify.register(deleteWorklist, { prefix: 'api' });

  fastify.register(columnCreate, { prefix: 'api' });
  fastify.register(columnUpdate, { prefix: 'api' });
  fastify.register(columnDelete, { prefix: 'api' });
  fastify.register(columnList, { prefix: 'api' });
}, {
  name: 'worklist',
  dependencies: ['model'],
});