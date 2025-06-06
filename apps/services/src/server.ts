import closeWithGrace from "close-with-grace";
import { createApp } from './app.js'
import figlet from 'figlet'

const app = await createApp({
    trustProxy: true,
    logger: true
})

closeWithGrace(
    { delay: 10000 },
    async ({ err, signal }: { err?: Error; signal?: string }) => {
      if (err) {
        app.log.error(err);
      }
  
      app.log.info(`[${signal}] Gracefully closing the server instance.`)
  
      await app.close() 
    },
  );
  
  app.listen({ host: "0.0.0.0", port: app.configuration.APPLICATION_PORT }, (err) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    app.log.info(`${app.configuration.APPLICATION_NAME} started listening on: ${app.configuration.APPLICATION_PORT}.`)
    console.log(app.printRoutes())
    figlet('Worklist', { font: "Ghost"}, (err, result) => console.log(result))
  });
