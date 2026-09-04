import * as s from 'remix/data-schema'
import * as f from 'remix/data-schema/form-data'
import { maxLength, minLength } from 'remix/data-schema/checks'
import { createController } from 'remix/router'
import { redirect } from 'remix/response/redirect'

import { assets } from '../assets.ts'
import { letters, letterDesigns, letterVisibilities, type Letter } from '../data/schema.ts'
import { databaseContext } from '../middleware/database.ts'
import { routes } from '../routes.ts'
import { HomePage, type FormErrors, type LetterFormValues, type PublicLetter } from './home-page.tsx'

const trimmedString = s.string().transform((value) => value.trim())

const letterFormSchema = f.object({
  author: f.field(trimmedString.pipe(minLength(1), maxLength(40))),
  email: f.field(
    trimmedString.refine(
      (value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      'Enter a valid email address or leave this blank.',
    ),
  ),
  body: f.field(trimmedString.pipe(minLength(1), maxLength(420))),
  design: f.field(s.enum_(letterDesigns)),
  visibility: f.field(s.enum_(letterVisibilities)),
  company: f.field(s.defaulted(s.string(), '')),
})

export default createController(routes, {
  actions: {
    async assets(context) {
      return (await assets.fetch(context.request)) ?? new Response('Not Found', { status: 404 })
    },

    async home(context) {
      let database = context.get(databaseContext)
      let publicLetters = await database.findMany(letters, {
        where: { visibility: 'public' },
        orderBy: ['created_at', 'desc'],
        limit: 48,
      })

      return context.render(
        <HomePage
          publicLetters={publicLetters.map(toPublicLetter)}
          sent={context.url.searchParams.get('sent') === '1'}
        />,
        { headers: { 'Cache-Control': 'no-store' } },
      )
    },

    async createLetter(context) {
      let formValue = context.get(FormData)
      let parsed = s.parseSafe(letterFormSchema, formValue, {
        errorMap({ code, defaultMessage }) {
          if (code === 'string.min_length') return 'This field cannot be empty.'
          if (code === 'string.max_length') return 'This is too long.'
          return defaultMessage
        },
      })

      let database = context.get(databaseContext)

      if (!parsed.success) {
        let publicLetters = await database.findMany(letters, {
          where: { visibility: 'public' },
          orderBy: ['created_at', 'desc'],
          limit: 48,
        })

        return context.render(
          <HomePage
            errors={issuesToErrors(parsed.issues)}
            publicLetters={publicLetters.map(toPublicLetter)}
            values={readFormValues(formValue)}
          />,
          { status: 400, headers: { 'Cache-Control': 'no-store' } },
        )
      }

      if (parsed.value.company !== '') {
        return redirect(`${routes.home.href()}?sent=1#write`, 303)
      }

      await database.create(letters, {
        author: parsed.value.author,
        email: parsed.value.email || null,
        body: parsed.value.body,
        design: parsed.value.design,
        visibility: parsed.value.visibility,
        public_reply: null,
        created_at: Date.now(),
        replied_at: null,
      })

      return redirect(`${routes.home.href()}?sent=1#write`, 303)
    },
  },
})

function toPublicLetter(letter: Letter): PublicLetter {
  return {
    id: letter.id,
    author: letter.author,
    body: letter.body,
    publicReply: letter.public_reply,
    createdAt: letter.created_at,
  }
}

function issuesToErrors(issues: readonly s.Issue[]): FormErrors {
  let errors: FormErrors = {}

  for (let issue of issues) {
    let firstPath = issue.path?.[0]
    let field =
      typeof firstPath === 'object' && firstPath !== null && 'key' in firstPath
        ? String(firstPath.key)
        : String(firstPath ?? 'form')

    if (!errors[field]) errors[field] = issue.message
  }

  return errors
}

function readFormValues(formValue: FormData): LetterFormValues {
  let design = readText(formValue, 'design')
  let visibility = readText(formValue, 'visibility')

  return {
    author: readText(formValue, 'author'),
    email: readText(formValue, 'email'),
    body: readText(formValue, 'body'),
    design: letterDesigns.includes(design as (typeof letterDesigns)[number])
      ? (design as (typeof letterDesigns)[number])
      : 'airmail',
    visibility: letterVisibilities.includes(
      visibility as (typeof letterVisibilities)[number],
    )
      ? (visibility as (typeof letterVisibilities)[number])
      : 'public',
  }
}

function readText(formValue: FormData, name: string): string {
  let value = formValue.get(name)
  return typeof value === 'string' ? value : ''
}
