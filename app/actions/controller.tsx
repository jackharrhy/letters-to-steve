import * as s from 'remix/data-schema'
import * as f from 'remix/data-schema/form-data'
import { maxLength, minLength } from 'remix/data-schema/checks'
import type { SqliteDatabase } from 'remix/data-table/sqlite'
import { inList } from 'remix/data-table/operators'
import { createController } from 'remix/router'
import { redirect } from 'remix/response/redirect'

import { assets } from '../assets.ts'
import { issueLetters, issues, letters, type Issue } from '../data/schema.ts'
import { databaseContext } from '../middleware/database.ts'
import { routes } from '../routes.ts'
import {
  HomePage,
  IssuePage,
  type FormErrors,
  type LetterFormValues,
  type PublicIssue,
} from './home-page.tsx'

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
  canPublish: f.field(s.defaulted(s.string(), '')),
  company: f.field(s.defaulted(s.string(), '')),
})

export default createController(routes, {
  actions: {
    async assets(context) {
      return (await assets.fetch(context.request)) ?? new Response('Not Found', { status: 404 })
    },

    async home(context) {
      let database = context.get(databaseContext)
      let publicIssues = await findPublicIssues(database)

      return context.render(
        <HomePage
          issues={publicIssues}
          sent={context.url.searchParams.get('sent') === '1'}
        />,
        { headers: { 'Cache-Control': 'no-store' } },
      )
    },

    async issue(context) {
      let issueId = readId(context.params.issueId)
      if (issueId === null) return new Response('Letter not found.', { status: 404 })

      let database = context.get(databaseContext)
      let issue = await database.find(issues, issueId)
      if (!issue || issue.state !== 'published' || issue.published_at === null) {
        return new Response('Letter not found.', { status: 404 })
      }

      let links = await database.findMany(issueLetters, {
        where: { issue_id: issue.id },
        orderBy: ['position', 'asc'],
      })

      return context.render(
        <IssuePage issue={toPublicIssue({ ...issue, published_at: issue.published_at }, links)} />,
        {
          headers: { 'Cache-Control': 'no-store' },
        },
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
        return context.render(
          <HomePage
            errors={issuesToErrors(parsed.issues)}
            issues={await findPublicIssues(database)}
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
        can_publish: parsed.value.canPublish === 'yes',
        state: 'inbox',
        created_at: Date.now(),
        private_replied_at: null,
      })

      return redirect(`${routes.home.href()}?sent=1#write`, 303)
    },
  },
})

async function findPublicIssues(database: SqliteDatabase): Promise<PublicIssue[]> {
  let published = await database.findMany(issues, {
    where: { state: 'published' },
    orderBy: ['published_at', 'desc'],
    limit: 48,
  })
  let publishedWithDates = published.filter(
    (issue): issue is Issue & { published_at: number } => issue.published_at !== null,
  )

  if (publishedWithDates.length === 0) return []

  let links = await database.findMany(issueLetters, {
    where: inList(
      issueLetters.issue_id,
      publishedWithDates.map((issue) => issue.id),
    ),
    orderBy: [
      ['issue_id', 'asc'],
      ['position', 'asc'],
    ],
  })

  return publishedWithDates.map((issue) =>
    toPublicIssue(
      issue,
      links.filter((link) => link.issue_id === issue.id),
    ),
  )
}

function toPublicIssue(
  issue: Issue & { published_at: number },
  links: Array<{ public_author: string; public_body: string }>,
): PublicIssue {
  return {
    id: issue.id,
    letters: links.map((link) => ({
      author: link.public_author,
      body: link.public_body,
    })),
    publishedAt: issue.published_at,
    response: issue.response,
  }
}

function issuesToErrors(validationIssues: readonly s.Issue[]): FormErrors {
  let errors: FormErrors = {}

  for (let issue of validationIssues) {
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
  return {
    author: readText(formValue, 'author'),
    email: readText(formValue, 'email'),
    body: readText(formValue, 'body'),
    canPublish: readText(formValue, 'canPublish') === 'yes',
  }
}

function readId(value: string | undefined): number | null {
  let id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

function readText(formValue: FormData, name: string): string {
  let value = formValue.get(name)
  return typeof value === 'string' ? value : ''
}
