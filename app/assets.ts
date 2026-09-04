import { createAssetServer } from 'remix/assets'
import { uiHmr } from 'remix/ui-hmr/assets'

const rootDir = process.cwd()
const nodeEnv = process.env.NODE_ENV ?? 'development'
const isDevelopment = nodeEnv === 'development'
const isHmr = Boolean(isDevelopment && process.env.REMIX_NODE_HMR)

export const assets = createAssetServer({
  basePath: '/assets',
  rootDir,

  allowFiles: ['app/routes.ts', 'app/**/public/**'],
  allowPackages: [
    'remix',
    '@tiptap/core',
    '@tiptap/extension-blockquote',
    '@tiptap/extension-bold',
    '@tiptap/extension-document',
    '@tiptap/extension-hard-break',
    '@tiptap/extension-image',
    '@tiptap/extension-italic',
    '@tiptap/extension-link',
    '@tiptap/extension-list',
    '@tiptap/extension-paragraph',
    '@tiptap/extension-placeholder',
    '@tiptap/extension-text',
    '@tiptap/extensions',
    '@tiptap/pm',
    '@fontsource-variable/shantell-sans',
    '@fontsource-variable/literata',
  ],
  denyFiles: ['app/**/*.test.*'],
  files: { extensions: ['.woff2'] },
  sourceMaps: isDevelopment ? 'external' : undefined,
  minify: !isDevelopment,
  watch: isDevelopment,
  hmr: isHmr
    ? async () => (await import('remix/node-hmr/runtime')).createBrowserHmrChannel()
    : undefined,
  scripts: { loaders: isHmr ? [uiHmr()] : undefined },
})

export const browserEntryHref = await assets.getHref('app/actions/public/entry.ts')
