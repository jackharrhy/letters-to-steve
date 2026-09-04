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
      <Document title="Steve's inbox | Letters to Steve" description="Steve's private letter inbox.">
        <div className="admin-shell">
          <header className="admin-header">
            <div>
              <a href={routes.home.href()}>Letters to Steve</a>
              <h1>Steve&apos;s inbox</h1>
            </div>
            <p>{letters.length} letter{letters.length === 1 ? '' : 's'}</p>
          </header>

          <main>
            {setupRequired ? (
              <section className="setup-card">
                <h2>One bit of setup first</h2>
                <p>
                  Set <code>STEVE_ADMIN_PASSWORD</code> in the environment, then reload this page.
                  Sign in with the username <code>steve</code>.
                </p>
              </section>
            ) : letters.length === 0 ? (
              <section className="inbox-empty">
                <h2>The inbox is empty.</h2>
                <p>New letters will appear here, including notes marked for Steve only.</p>
              </section>
            ) : (
              <div className="inbox-list">
                {letters.map((letter) => (
                  <article className="inbox-letter" id={`letter-${letter.id}`} key={letter.id}>
                    <header>
                      <div>
                        <p className="inbox-author">{letter.author}</p>
                        <p className="inbox-date">{formatDate(letter.created_at)}</p>
                      </div>
                      <span className={`visibility-label visibility-${letter.visibility}`}>
                        {letter.visibility === 'public' ? 'On the wall' : 'For Steve only'}
                      </span>
                    </header>

                    <p className="inbox-body">{letter.body}</p>

                    <div className="inbox-actions">
                      {letter.visibility === 'public' ? (
                        <form action={routes.steve.reply.href({ letterId: String(letter.id) })} method="post">
                          <label htmlFor={`reply-${letter.id}`}>
                            {letter.public_reply ? 'Edit public reply' : 'Write a public reply'}
                          </label>
                          <textarea
                            id={`reply-${letter.id}`}
                            name="reply"
                            rows={3}
                            maxLength={800}
                            required
                            defaultValue={letter.public_reply ?? ''}
                          />
                          <button type="submit">
                            {letter.public_reply ? 'Update reply' : 'Post reply'}
                          </button>
                        </form>
                      ) : (
                        <p className="private-note">This letter will never appear on the public wall.</p>
                      )}

                      {letter.email ? (
                        <a
                          className="email-link"
                          href={privateReplyHref(letter.email, letter.author)}
                        >
                          Reply by email
                        </a>
                      ) : (
                        <p className="no-email">No email address was left.</p>
                      )}
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
