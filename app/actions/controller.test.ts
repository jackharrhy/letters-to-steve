import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { createAppRouter } from '../router.ts'
import { routes } from '../routes.ts'

describe('editorial letter routes', () => {
  it('keeps submissions private until Steve publishes a grouped issue', async () => {
    let previousPassword = process.env.STEVE_ADMIN_PASSWORD
    process.env.STEVE_ADMIN_PASSWORD = 'test-secret'

    let { database, router } = await createAppRouter({ databasePath: ':memory:' })

    try {
      let initialHomeHtml = await (
        await router.fetch(request(routes.home.href()))
      ).text()
      assert.match(initialHomeHtml, /href="\/write"[^>]*>\s*write to steve/)
      assert.match(initialHomeHtml, /href="\/steve"[^>]*>\s*steve login/)
      assert.doesNotMatch(initialHomeHtml, /name="body"/)

      let writeResponse = await router.fetch(request(routes.write.href()))
      let writeHtml = await writeResponse.text()
      assert.equal(writeResponse.status, 200)
      assert.match(writeHtml, /<h1[^>]*>dear steve,/)
      assert.match(writeHtml, /class="letter-textarea"/)

      let invalidResponse = await submitLetter(router, {
        author: '',
        body: '',
        canPublish: true,
        email: 'not-an-email',
      })
      assert.equal(invalidResponse.status, 400)
      assert.match(await invalidResponse.text(), /Write to Steve/)

      let firstLetterResponse = await submitLetter(router, {
        author: 'Mira',
        body: 'Could a small habit change a life?',
        canPublish: true,
        email: 'mira@example.com',
      })
      assert.equal(firstLetterResponse.status, 303)
      assert.equal(firstLetterResponse.headers.get('Location'), '/write?sent=1#write')
      assert.equal(
        (
          await submitLetter(router, {
            author: 'Rowan',
            body: 'How do you begin again?',
            canPublish: true,
            email: '',
          })
        ).status,
        303,
      )
      assert.equal(
        (
          await submitLetter(router, {
            author: 'Noah',
            body: 'A note meant only for Steve.',
            canPublish: false,
            email: 'noah@example.com',
          })
        ).status,
        303,
      )

      let homeHtml = await (await router.fetch(request(routes.home.href()))).text()
      assert.doesNotMatch(homeHtml, /Could a small habit/)
      assert.doesNotMatch(homeHtml, /How do you begin/)
      assert.doesNotMatch(homeHtml, /A note meant only/)
      assert.doesNotMatch(homeHtml, /example\.com/)

      let unauthorizedResponse = await router.fetch(request(routes.steve.index.href()))
      assert.equal(unauthorizedResponse.status, 401)
      assert.match(unauthorizedResponse.headers.get('WWW-Authenticate') ?? '', /Basic/)

      let inboxResponse = await router.fetch(
        request(routes.steve.index.href(), { headers: steveHeaders() }),
      )
      let inboxHtml = await inboxResponse.text()
      assert.equal(inboxResponse.status, 200)
      assert.match(inboxHtml, /Could a small habit/)
      assert.match(inboxHtml, /How do you begin/)
      assert.match(inboxHtml, /A note meant only/)
      assert.match(inboxHtml, /mailto:noah%40example\.com/)

      let privateIssueResponse = await postForm(
        router,
        routes.steve.createIssue.href(),
        {
          intent: 'draft',
          letterId: ['3'],
          response: '',
        },
      )
      assert.equal(privateIssueResponse.status, 409)

      let draftResponse = await postForm(router, routes.steve.createIssue.href(), {
        intent: 'draft',
        letterId: ['1', '2'],
        response: 'A beginning of an answer.',
      })
      assert.equal(draftResponse.status, 303)

      homeHtml = await (await router.fetch(request(routes.home.href()))).text()
      assert.doesNotMatch(homeHtml, /A beginning of an answer/)
      assert.equal(
        (await router.fetch(request(routes.issue.href({ issueId: '1' })))).status,
        404,
      )

      let publishResponse = await postForm(
        router,
        routes.steve.updateIssue.href({ issueId: '1' }),
        {
          'author-1': 'Mira, edited',
          'author-2': 'Rowan',
          'body-1': 'Could a small habit change a life?',
          'body-2': 'How do you begin again?',
          intent: 'publish',
          response: 'Begin with the thing small enough to do today.',
        },
      )
      assert.equal(publishResponse.status, 303)

      let publishedHome = await router.fetch(request(routes.home.href()))
      let publishedHtml = await publishedHome.text()
      assert.equal(publishedHome.status, 200)
      assert.match(publishedHtml, /Mira, edited/)
      assert.match(publishedHtml, /Could a small habit/)
      assert.match(publishedHtml, /How do you begin/)
      assert.match(publishedHtml, /Begin with the thing small enough/)
      assert.doesNotMatch(publishedHtml, /A note meant only/)
      assert.doesNotMatch(publishedHtml, /example\.com/)

      let issueResponse = await router.fetch(request(routes.issue.href({ issueId: '1' })))
      assert.equal(issueResponse.status, 200)
      assert.match(await issueResponse.text(), /Begin with the thing small enough/)

      let editedInboxHtml = await (
        await router.fetch(request(routes.steve.index.href(), { headers: steveHeaders() }))
      ).text()
      assert.match(editedInboxHtml, /original/)
      assert.match(editedInboxHtml, />Mira</)

      let unpublishResponse = await postForm(
        router,
        routes.steve.updateIssue.href({ issueId: '1' }),
        {
          'author-1': 'Mira, edited',
          'author-2': 'Rowan',
          'body-1': 'Could a small habit change a life?',
          'body-2': 'How do you begin again?',
          intent: 'unpublish',
          response: 'Begin with the thing small enough to do today.',
        },
      )
      assert.equal(unpublishResponse.status, 303)
      assert.doesNotMatch(
        await (await router.fetch(request(routes.home.href()))).text(),
        /Begin with the thing small enough/,
      )

      let privateReplyResponse = await postForm(
        router,
        routes.steve.updateLetter.href({ letterId: '3' }),
        { intent: 'private-replied' },
      )
      assert.equal(privateReplyResponse.status, 303)

      let restoreResponse = await postForm(
        router,
        routes.steve.updateLetter.href({ letterId: '3' }),
        { intent: 'restore' },
      )
      assert.equal(restoreResponse.status, 303)
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
    canPublish: boolean
    email: string
  },
): Promise<Response> {
  return postForm(
    router,
    routes.createLetter.href(),
    {
      author: values.author,
      body: values.body,
      canPublish: values.canPublish ? 'yes' : undefined,
      company: '',
      email: values.email,
    },
    false,
  )
}

async function postForm(
  router: Awaited<ReturnType<typeof createAppRouter>>['router'],
  pathname: string,
  values: Record<string, string | string[] | undefined>,
  authenticate = true,
): Promise<Response> {
  let form = new FormData()
  for (let [name, value] of Object.entries(values)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (let item of value) form.append(name, item)
    } else {
      form.set(name, value)
    }
  }

  return router.fetch(
    request(pathname, {
      body: form,
      headers: authenticate ? steveHeaders({ Origin: 'http://letters.test' }) : undefined,
      method: 'POST',
    }),
  )
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
