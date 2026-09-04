import * as s from 'remix/data-schema'
import * as f from 'remix/data-schema/form-data'
import { maxLength, minLength } from 'remix/data-schema/checks'
import { createController } from 'remix/router'
import { redirect } from 'remix/response/redirect'

import { letters } from '../../data/schema.ts'
import { databaseContext } from '../../middleware/database.ts'
import { routes } from '../../routes.ts'
import { challengeSteve, getSteveAccess } from './auth.ts'
import { SteveInboxPage } from './inbox-page.tsx'

const replySchema = f.object({
  reply: f.field(
    s.string().transform((value) => value.trim()).pipe(minLength(1), maxLength(800)),
  ),
})

export default createController(routes.steve, {
  actions: {
    async index(context) {
      let access = getSteveAccess(context.request)
      if (access === 'unconfigured') {
        return context.render(<SteveInboxPage letters={[]} setupRequired />, {
          status: 503,
          headers: { 'Cache-Control': 'no-store' },
        })
      }
      if (access === 'unauthorized') return challengeSteve()

      let database = context.get(databaseContext)
      let allLetters = await database.findMany(letters, {
        orderBy: ['created_at', 'desc'],
        limit: 100,
      })

      return context.render(<SteveInboxPage letters={allLetters} />, {
        headers: { 'Cache-Control': 'no-store' },
      })
    },

    async reply(context) {
      let access = getSteveAccess(context.request)
      if (access === 'unconfigured') {
        return new Response('Admin password is not configured.', { status: 503 })
      }
      if (access === 'unauthorized') return challengeSteve()

      let origin = context.request.headers.get('origin')
      if (origin && origin !== new URL(context.request.url).origin) {
        return new Response('Cross-origin form submissions are not allowed.', { status: 403 })
      }

      let letterId = Number(context.params.letterId)
      if (!Number.isSafeInteger(letterId) || letterId < 1) {
        return new Response('Letter not found.', { status: 404 })
      }

      let parsed = s.parseSafe(replySchema, context.get(FormData))
      if (!parsed.success) {
        return new Response('Write a reply between 1 and 800 characters.', { status: 400 })
      }

      let database = context.get(databaseContext)
      let letter = await database.find(letters, letterId)
      if (!letter) return new Response('Letter not found.', { status: 404 })
      if (letter.visibility !== 'public') {
        return new Response('Private letters cannot receive a public reply.', { status: 409 })
      }

      await database.update(letters, letterId, {
        public_reply: parsed.value.reply,
        replied_at: Date.now(),
      })

      return redirect(`${routes.steve.index.href()}#letter-${letterId}`, 303)
    },
  },
})
