import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { createAppRouter } from '../router.ts'
import { routes } from '../routes.ts'

describe('letter routes', () => {
  it('keeps private letters off the wall and lets Steve publish a reply', async () => {
    let previousPassword = process.env.STEVE_ADMIN_PASSWORD
    process.env.STEVE_ADMIN_PASSWORD = 'test-secret'

    let { database, router } = await createAppRouter({ databasePath: ':memory:' })

    try {
      let invalidResponse = await submitLetter(router, {
        author: '',
        body: '',
        design: 'airmail',
        email: 'not-an-email',
        visibility: 'public',
      })
      assert.equal(invalidResponse.status, 400)

      let publicResponse = await submitLetter(router, {
        author: 'Mira',
        body: 'A public note for the wall.',
        design: 'pressed',
        email: 'mira@example.com',
        visibility: 'public',
      })
      assert.equal(publicResponse.status, 303)

      let privateResponse = await submitLetter(router, {
        author: 'Noah',
        body: 'A note meant only for Steve.',
        design: 'night',
        email: 'noah@example.com',
        visibility: 'private',
      })
      assert.equal(privateResponse.status, 303)

      let homeResponse = await router.fetch(request(routes.home.href()))
      let homeHtml = await homeResponse.text()
      assert.match(homeHtml, /A public note for the wall\./)
      assert.doesNotMatch(homeHtml, /A note meant only for Steve\./)
      assert.doesNotMatch(homeHtml, /mira@example\.com/)
      assert.doesNotMatch(homeHtml, /noah@example\.com/)

      let unauthorizedResponse = await router.fetch(request(routes.steve.index.href()))
      assert.equal(unauthorizedResponse.status, 401)
      assert.match(unauthorizedResponse.headers.get('WWW-Authenticate') ?? '', /Basic/)

      let inboxResponse = await router.fetch(
        request(routes.steve.index.href(), { headers: steveHeaders() }),
      )
      let inboxHtml = await inboxResponse.text()
      assert.equal(inboxResponse.status, 200)
      assert.match(inboxHtml, /A public note for the wall\./)
      assert.match(inboxHtml, /A note meant only for Steve\./)
      assert.match(inboxHtml, /mailto:mira%40example\.com/)
      assert.match(inboxHtml, /mailto:noah%40example\.com/)

      let replyForm = new FormData()
      replyForm.set('reply', 'Thanks for writing, Mira.')

      let replyResponse = await router.fetch(
        request(routes.steve.reply.href({ letterId: '1' }), {
          body: replyForm,
          headers: steveHeaders({ Origin: 'http://letters.test' }),
          method: 'POST',
        }),
      )
      assert.equal(replyResponse.status, 303)

      let repliedHomeResponse = await router.fetch(request(routes.home.href()))
      assert.match(await repliedHomeResponse.text(), /Thanks for writing, Mira\./)

      let privateReplyResponse = await router.fetch(
        request(routes.steve.reply.href({ letterId: '2' }), {
          body: replyForm,
          headers: steveHeaders(),
          method: 'POST',
        }),
      )
      assert.equal(privateReplyResponse.status, 409)
    } finally {
      await database.close()
      if (previousPassword === undefined) delete process.env.STEVE_ADMIN_PASSWORD
      else process.env.STEVE_ADMIN_PASSWORD = previousPassword
    }
  })
})

async function submitLetter(
  router: Awaited<ReturnType<typeof createAppRouter>>['router'],
  values: {
    author: string
    body: string
    design: string
    email: string
    visibility: string
  },
): Promise<Response> {
  let form = new FormData()
  form.set('author', values.author)
  form.set('body', values.body)
  form.set('design', values.design)
  form.set('email', values.email)
  form.set('visibility', values.visibility)
  form.set('company', '')

  return router.fetch(request(routes.createLetter.href(), { body: form, method: 'POST' }))
}

function request(pathname: string, init?: RequestInit): Request {
  return new Request(new URL(pathname, 'http://letters.test'), init)
}

function steveHeaders(extra: Record<string, string> = {}): Headers {
  return new Headers({
    Authorization: `Basic ${Buffer.from('steve:test-secret').toString('base64')}`,
    ...extra,
  })
}
