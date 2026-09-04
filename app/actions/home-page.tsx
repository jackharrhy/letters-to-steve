import type { Handle } from 'remix/ui'

import { routes } from '../routes.ts'
import { CardComposer } from './card-composer.tsx'
import { Document } from './document.tsx'

export interface PublicIssueLetter {
  author: string
  body: string
}

export interface PublicIssue {
  id: number
  letters: PublicIssueLetter[]
  publishedAt: number
  response: string
}

export interface LetterFormValues {
  author: string
  body: string
  canPublish: boolean
  email: string
}

export type FormErrors = Record<string, string | undefined>

interface HomePageProps {
  errors?: FormErrors
  issues: PublicIssue[]
  sent?: boolean
  values?: LetterFormValues
}

const defaultValues: LetterFormValues = {
  author: '',
  body: '',
  canPublish: false,
  email: '',
}

export function HomePage(handle: Handle<HomePageProps>) {
  return () => {
    let { errors = {}, issues, sent = false, values = defaultValues } = handle.props

    return (
      <Document>
        <div className="site-shell">
          <SteveHeader />

          <main>
            <CardComposer errors={errors} sent={sent} values={values} />
            <IssueList issues={issues} />
          </main>
        </div>
      </Document>
    )
  }
}

export function IssuePage(handle: Handle<{ issue: PublicIssue }>) {
  return () => {
    let { issue } = handle.props

    return (
      <Document title={`Letter ${issue.id} | Letters to Steve`}>
        <div className="site-shell issue-page">
          <SteveHeader />
          <main>
            <p className="back-link">
              <a href={routes.home.href()}>all letters</a>
            </p>
            <IssueArticle issue={issue} />
          </main>
        </div>
      </Document>
    )
  }
}

function SteveHeader() {
  return () => (
    <header className="steve-header">
      <h1>
        <a href={routes.home.href()}>letters to steve</a>
      </h1>
      <img src="/steve.png" width="264" height="741" alt="Steve" />
    </header>
  )
}

function IssueList(handle: Handle<{ issues: PublicIssue[] }>) {
  return () => {
    let { issues } = handle.props

    return (
      <section className="letters" aria-labelledby="letters-title">
        <h2 id="letters-title">letters from steve</h2>

        {issues.length === 0 ? (
          <p className="empty">none yet.</p>
        ) : (
          <div className="issue-list">
            {issues.map((issue) => (
              <IssueArticle issue={issue} key={issue.id} />
            ))}
          </div>
        )}
      </section>
    )
  }
}

export function IssueArticle(handle: Handle<{ issue: PublicIssue }>) {
  return () => {
    let { issue } = handle.props
    let href = routes.issue.href({ issueId: String(issue.id) })

    return (
      <article className="issue" id={`issue-${issue.id}`}>
        <header className="issue-meta">
          <a href={href}>letter {issue.id}</a>
          <time dateTime={new Date(issue.publishedAt).toISOString()}>
            {formatDate(issue.publishedAt)}
          </time>
        </header>

        <div className="issue-questions">
          {issue.letters.map((letter, index) => (
            <blockquote className="issue-question" key={index}>
              <p>{letter.body}</p>
              <footer>{letter.author}</footer>
            </blockquote>
          ))}
        </div>

        <div className="issue-response">
          <p>{issue.response}</p>
          <strong>Steve</strong>
        </div>
      </article>
    )
  }
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(timestamp))
}
