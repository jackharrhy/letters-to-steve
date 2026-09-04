import type { Handle } from 'remix/ui'

import { routes } from '../routes.ts'
import type { FormErrors, LetterFormValues } from './home-page.tsx'

interface CardComposerProps {
  errors: FormErrors
  sent: boolean
  values: LetterFormValues
}

export function CardComposer(handle: Handle<CardComposerProps>) {
  return () => {
    let { errors, sent, values } = handle.props

    return (
      <section className="composer" id="write" aria-labelledby="composer-title">
        <h2 id="composer-title">dear steve,</h2>

        {sent ? (
          <p className="form-success" role="status">
            sent.
          </p>
        ) : null}

        {errors.form ? (
          <p className="field-error" role="alert">
            {errors.form}
          </p>
        ) : null}

        <form action={routes.createLetter.href()} method="post">
          <input type="hidden" name="design" value="airmail" />

          <div className="field">
            <label htmlFor="letter-body">letter</label>
            <textarea
              id="letter-body"
              name="body"
              rows={7}
              maxLength={420}
              required
              aria-invalid={Boolean(errors.body)}
              aria-describedby={errors.body ? 'body-error' : undefined}
              defaultValue={values.body}
            />
            {errors.body ? (
              <span className="field-error" id="body-error">
                {errors.body}
              </span>
            ) : null}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="letter-author">name</label>
              <input
                id="letter-author"
                name="author"
                type="text"
                maxLength={40}
                required
                autoComplete="name"
                aria-invalid={Boolean(errors.author)}
                aria-describedby={errors.author ? 'author-error' : undefined}
                defaultValue={values.author}
              />
              {errors.author ? (
                <span className="field-error" id="author-error">
                  {errors.author}
                </span>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="letter-email">email (optional, private)</label>
              <input
                id="letter-email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                defaultValue={values.email}
              />
              {errors.email ? (
                <span className="field-error" id="email-error">
                  {errors.email}
                </span>
              ) : null}
            </div>
          </div>

          <fieldset>
            <legend>visibility</legend>
            <div className="radio-row">
              <label>
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  defaultChecked={values.visibility === 'public'}
                />
                public
              </label>
              <label>
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  defaultChecked={values.visibility === 'private'}
                />
                private
              </label>
            </div>
            {errors.visibility ? <span className="field-error">{errors.visibility}</span> : null}
          </fieldset>

          <div className="honeypot" aria-hidden="true">
            <label htmlFor="company">company</label>
            <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <button type="submit">send</button>
        </form>
      </section>
    )
  }
}
