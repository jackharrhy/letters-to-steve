import type { Handle, RemixNode } from 'remix/ui'

export interface DocumentProps {
  children?: RemixNode
  description?: string
  head?: RemixNode
  preloadDesk?: boolean
  title?: string
}

export function Document(handle: Handle<DocumentProps>) {
  return () => {
    let {
      children,
      description = 'Leave a public or private letter for Steve.',
      head,
      preloadDesk = false,
      title = 'Letters to Steve',
    } = handle.props

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light dark" />
          <meta name="description" content={description} />
          <meta name="theme-color" content="#eef0f2" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#16191d" media="(prefers-color-scheme: dark)" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="stylesheet" href="/app.css?v=1" />
          <link
            rel="preload"
            href="/fonts/manrope-variable.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/ibm-plex-mono-regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          {preloadDesk ? (
            <link rel="preload" href="/correspondence-desk.webp?v=1" as="image" type="image/webp" />
          ) : null}
          <title>{title}</title>
          {head}
        </head>
        <body>{children}</body>
      </html>
    )
  }
}
