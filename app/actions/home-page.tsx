import type { Handle } from 'remix/ui'

import type { LetterDesign, LetterVisibility } from '../data/schema.ts'
import { CardComposer } from './card-composer.tsx'
import { Document } from './document.tsx'

export interface PublicLetter {
  id: number
  author: string
  body: string
  publicReply: string | null
  createdAt: number
}

export interface LetterFormValues {
  [key: string]: string
  author: string
  email: string
  body: string
  design: LetterDesign
  visibility: LetterVisibility
}

export type FormErrors = Record<string, string | undefined>

interface HomePageProps {
  errors?: FormErrors
  publicLetters: PublicLetter[]
  sent?: boolean
  values?: LetterFormValues
}

const defaultValues: LetterFormValues = {
  author: '',
  email: '',
  body: '',
  design: 'airmail',
  visibility: 'public',
}

export function HomePage(handle: Handle<HomePageProps>) {
  return () => {
    let { errors = {}, publicLetters, sent = false, values = defaultValues } = handle.props

    return (
      <Document>
        <div className="site-shell">
          <header className="steve-header">
            <h1>letters to steve</h1>
            <img src="/steve.png" width="264" height="741" alt="Steve" />
          </header>

          <main>
            <CardComposer errors={errors} sent={sent} values={values} />
            <LetterList letters={publicLetters} />
          </main>
        </div>
      </Document>
    )
  }
}

function LetterList(handle: Handle<{ letters: PublicLetter[] }>) {
  return () => {
    let { letters } = handle.props

    return (
      <section className="letters" aria-labelledby="letters-title">
        <h2 id="letters-title">letters</h2>

        {letters.length === 0 ? (
          <p className="empty">none yet.</p>
        ) : (
          <div className="letter-list">
            {letters.map((letter) => (
              <article className="letter" key={letter.id}>
                <p className="letter-body">{letter.body}</p>
                <footer className="letter-meta">
                  <strong>{letter.author}</strong>
                  <time dateTime={new Date(letter.createdAt).toISOString()}>
                    {formatMonth(letter.createdAt)}
                  </time>
                </footer>
                {letter.publicReply ? (
                  <div className="steve-reply">
                    <strong>steve:</strong>
                    <p>{letter.publicReply}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    )
  }
}

function formatMonth(timestamp: number): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(timestamp))
}
