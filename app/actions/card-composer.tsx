import type { Handle } from 'remix/ui'

import type { FormErrors, LetterFormValues } from './home-page.tsx'

interface CardComposerProps {
  action: string
  errors: FormErrors
  sent: boolean
  values: LetterFormValues
}

const designs = [
  { id: 'airmail', label: 'Air mail' },
  { id: 'graph', label: 'Graph' },
  { id: 'pressed', label: 'Pressed' },
  { id: 'night', label: 'Night' },
] as const

export function CardComposer(handle: Handle<CardComposerProps>) {
  return () => {
    let { action, errors, sent, values } = handle.props

    return (
      <section className="composer" id="write" aria-labelledby="composer-title">
        <div className="composer-heading">
          <h2 id="composer-title">Dear Steve,</h2>
          <span>420 max</span>
        </div>

        {sent ? (
          <p className="form-success" role="status">
            Your letter is on its way.
          </p>
        ) : null}

        {errors.form ? (
          <p className="field-error" role="alert">
            {errors.form}
          </p>
        ) : null}

        <form action={action} method="post">
          <div className="writing-card">
            <div className="field message-field">
              <label htmlFor="letter-body">Your letter</label>
              <textarea
                id="letter-body"
                name="body"
                rows={8}
                maxLength={420}
                required
                aria-invalid={Boolean(errors.body)}
                aria-describedby={errors.body ? 'body-error' : undefined}
                placeholder="Write what you came to say..."
                defaultValue={values.body}
              />
              {errors.body ? (
                <span className="field-error" id="body-error">
                  {errors.body}
                </span>
              ) : null}
            </div>

            <div className="card-address">
              <div className="field">
                <label htmlFor="letter-author">From</label>
                <input
                  id="letter-author"
                  name="author"
                  type="text"
                  maxLength={40}
                  required
                  autoComplete="name"
                  aria-invalid={Boolean(errors.author)}
                  aria-describedby={errors.author ? 'author-error' : undefined}
                  placeholder="Your name"
                  defaultValue={values.author}
                />
                {errors.author ? (
                  <span className="field-error" id="author-error">
                    {errors.author}
                  </span>
                ) : null}
              </div>

              <div className="field">
                <label htmlFor="letter-email">Email (optional)</label>
                <input
                  id="letter-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby="email-help"
                  placeholder="For a private reply"
                  defaultValue={values.email}
                />
                <span className="field-help" id="email-help">
                  Never shown on the wall.
                </span>
                {errors.email ? <span className="field-error">{errors.email}</span> : null}
              </div>
            </div>
          </div>

          <fieldset className="design-picker">
            <legend>Choose the paper</legend>
            <div className="design-options">
              {designs.map((option) => (
                <label className="design-option" key={option.id}>
                  <input
                    id={`design-${option.id}`}
                    type="radio"
                    name="design"
                    value={option.id}
                    defaultChecked={values.design === option.id}
                  />
                  <span className={`paper-swatch design-${option.id}`} aria-hidden="true"></span>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors.design ? <span className="field-error">{errors.design}</span> : null}
          </fieldset>

          <fieldset className="visibility-picker">
            <legend>Who should see it?</legend>
            <label>
              <input
                type="radio"
                name="visibility"
                value="public"
                defaultChecked={values.visibility === 'public'}
              />
              <span>
                <strong>Pin it to the wall</strong>
                <small>Your name and letter will be public.</small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="visibility"
                value="private"
                defaultChecked={values.visibility === 'private'}
              />
              <span>
                <strong>For Steve only</strong>
                <small>It stays inside his private inbox.</small>
              </span>
            </label>
            {errors.visibility ? <span className="field-error">{errors.visibility}</span> : null}
          </fieldset>

          <div className="honeypot" aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <button className="send-button" type="submit">
            Send to Steve
          </button>
        </form>
      </section>
    )
  }
}
