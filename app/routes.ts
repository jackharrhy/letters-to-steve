import { get, post, route } from 'remix/routes'

export const routes = route({
  assets: get('/assets/*path'),
  home: get('/'),
  createLetter: post('/letters'),
  steve: route('steve', {
    index: get('/'),
    reply: post('/letters/:letterId/reply'),
  }),
})
