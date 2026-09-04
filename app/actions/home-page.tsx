import type { Handle } from 'remix/ui'

import type { LetterDesign, LetterVisibility } from '../data/schema.ts'
import { routes } from '../routes.ts'
import { CardComposer } from './card-composer.tsx'
import { Document } from './document.tsx'

export interface PublicLetter {
  id: number
  author: string
  body: string
  design: LetterDesign
  publicReply: string | null
  createdAt: number
  repliedAt: number | null
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
      <Document preloadDesk>
        <div className="site-shell">
          <SiteHeader />
          <main>
            <section className="hero" aria-labelledby="hero-title">
              <div className="hero-copy">
                <p className="eyebrow">An open mailbox</p>
                <h1 id="hero-title">Leave Steve a letter.</h1>
                <p className="hero-intro">
                  Write a note, pick its paper, and decide whether it belongs on the wall or only in
                  Steve&apos;s hands.
                </p>
                <a className="primary-link" href="#write">
                  Write a letter
                </a>
              </div>

              <div className="composer-stage">
                <CardComposer
                  action={routes.createLetter.href()}
                  errors={errors}
                  sent={sent}
                  values={values}
                />
              </div>
            </section>

            <LetterWall letters={publicLetters} />
          </main>
          <footer className="site-footer">
            <p>A small corner of the web for correspondence.</p>
            <a href="#top">Back to the mailbox</a>
          </footer>
        </div>
      </Document>
    )
  }
}

function SiteHeader() {
  return () => (
    <header className="site-header" id="top">
      <a className="wordmark" href={routes.home.href()}>
        <span>letters</span>
        <span>to Steve</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="#write">Write</a>
        <a href="#wall">Read</a>
      </nav>
    </header>
  )
}

function LetterWall(handle: Handle<{ letters: PublicLetter[] }>) {
  return () => {
    let { letters } = handle.props

    return (
      <section className="wall-section" id="wall" aria-labelledby="wall-title">
        <div className="wall-heading">
          <h2 id="wall-title">Letters on the wall</h2>
          <p>The notes their writers chose to share, with Steve&apos;s replies tucked underneath.</p>
        </div>

        {letters.length === 0 ? (
          <div className="wall-empty">
            <div className="letter-card design-graph tilt-left">
              <p>Nothing is pinned up yet. Yours could be the first.</p>
              <p className="letter-signature">The empty wall</p>
            </div>
          </div>
        ) : (
          <div className="letter-wall">
            {letters.map((letter, index) => (
              <LetterCard letter={letter} position={index} key={letter.id} />
            ))}
          </div>
        )}
      </section>
    )
  }
}

function LetterCard(handle: Handle<{ letter: PublicLetter; position: number }>) {
  return () => {
    let { letter, position } = handle.props
    let tilt = ['tilt-left', 'tilt-right', 'tilt-soft'][position % 3]

    return (
      <article className={`letter-card design-${letter.design} ${tilt}`}>
        <p className="letter-body">{letter.body}</p>
        <footer className="letter-meta">
          <p className="letter-signature">{letter.author}</p>
          <time dateTime={new Date(letter.createdAt).toISOString()}>{formatMonth(letter.createdAt)}</time>
        </footer>
        {letter.publicReply ? (
          <div className="steve-reply">
            <p className="reply-label">Steve replied</p>
            <p>{letter.publicReply}</p>
          </div>
        ) : null}
      </article>
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
