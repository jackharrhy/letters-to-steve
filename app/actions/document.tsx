import type { Handle, RemixNode } from 'remix/ui'

import { browserEntryHref } from '../assets.ts'

export interface DocumentProps {
  browserRuntime?: boolean
  children?: RemixNode
  description?: string
  head?: RemixNode
  title?: string
}

export function Document(handle: Handle<DocumentProps>) {
  return () => {
    let {
      children,
      browserRuntime = true,
      description = 'A letter for Steve.',
      head,
      title = 'Letters to Steve',
    } = handle.props

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light" />
          <meta name="description" content={description} />
          <meta name="theme-color" content="#f7f7f5" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="stylesheet" href="/app.css?v=9" />
          <title>{title}</title>
          {head}
        </head>
        <body>
          {children}
          {browserRuntime ? <script type="module" src={browserEntryHref} /> : null}
        </body>
      </html>
    )
  }
}
