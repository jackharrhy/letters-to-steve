import { createRouter, type MiddlewareContext } from 'remix/router'
import { formData } from 'remix/middleware/form-data'
import { render } from 'remix/middleware/render'
import { staticFiles } from 'remix/middleware/static'

import controller from './actions/controller.tsx'
import steveController from './actions/steve/controller.tsx'
import { assets } from './assets.ts'
import { createLettersDatabase } from './data/database.ts'
import { loadDatabase } from './middleware/database.ts'
import { routes } from './routes.ts'

const renderMiddleware = render({ assets })

export async function createAppRouter(options: { databasePath?: string } = {}) {
  let database = await createLettersDatabase(options.databasePath)
  let databaseMiddleware = loadDatabase(database)
  let formDataMiddleware = formData()
  let staticMiddleware = staticFiles('./public', {
    cacheControl:
      process.env.NODE_ENV === 'production'
        ? 'public, max-age=604800'
        : 'no-cache',
    index: false,
  })

  let middleware = [
    staticMiddleware,
    formDataMiddleware,
    databaseMiddleware,
    renderMiddleware,
  ] as const

  type AppContext = MiddlewareContext<typeof middleware>

  let appRouter = createRouter<AppContext>({ middleware })
  appRouter.map(routes, controller)
  appRouter.map(routes.steve, steveController)

  return { database, router: appRouter }
}

type AppContext = MiddlewareContext<
  [
    ReturnType<typeof staticFiles>,
    ReturnType<typeof formData>,
    ReturnType<typeof loadDatabase>,
    typeof renderMiddleware,
  ]
>

declare module 'remix/router' {
  interface RouterTypes {
    context: AppContext
  }
}

export const { database, router } = await createAppRouter({
  databasePath: process.env.NODE_ENV === 'test' ? ':memory:' : undefined,
})
