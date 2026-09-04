import type { Handle } from 'remix/ui'

import type { Letter } from '../../data/schema.ts'
import { routes } from '../../routes.ts'
import { Document } from '../document.tsx'

interface SteveInboxPageProps {
  letters: Letter[]
  setupRequired?: boolean
}

export function SteveInboxPage(handle: Handle<SteveInboxPageProps>) {
  return () => {
    let { letters, setupRequired = false } = handle.props

    return (
      <Document title="Steve's inbox | Letters to Steve" description="Steve's private inbox.">
        <div className="admin-shell">
          <header className="admin-header">
            <a href={routes.home.href()}>letters to steve</a>
            <h1>inbox ({letters.length})</h1>
          </header>

          <main>
            {setupRequired ? (
              <section className="setup">
                <h2>setup required</h2>
                <p>
                  Set <code>STEVE_ADMIN_PASSWORD</code>, then sign in as <code>steve</code>.
                </p>
              </section>
            ) : letters.length === 0 ? (
              <p className="empty">no letters.</p>
            ) : (
              <div className="inbox-list">
                {letters.map((letter) => (
                  <article className="inbox-letter" id={`letter-${letter.id}`} key={letter.id}>
                    <header>
                      <div>
                        <strong>{letter.author}</strong>
                        <time dateTime={new Date(letter.created_at).toISOString()}>
                          {formatDate(letter.created_at)}
                        </time>
                      </div>
                      <span>{letter.visibility}</span>
                    </header>

                    <p className="inbox-body">{letter.body}</p>

                    <div className="inbox-actions">
                      {letter.visibility === 'public' ? (
                        <form action={routes.steve.reply.href({ letterId: String(letter.id) })} method="post">
                          <label htmlFor={`reply-${letter.id}`}>reply</label>
                          <textarea
                            id={`reply-${letter.id}`}
                            name="reply"
                            rows={3}
                            maxLength={800}
                            required
                            defaultValue={letter.public_reply ?? ''}
                          />
                          <button type="submit">{letter.public_reply ? 'update' : 'post'}</button>
                        </form>
                      ) : null}

                      {letter.email ? (
                        <a href={privateReplyHref(letter.email, letter.author)}>email</a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </Document>
    )
  }
}

function privateReplyHref(email: string, author: string): string {
  let subject = encodeURIComponent('A reply from Steve')
  let body = encodeURIComponent(`Hi ${author},\n\n`)
  return `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(timestamp))
}
