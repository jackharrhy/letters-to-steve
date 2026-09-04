import { get, post, route } from 'remix/routes'

export const routes = route({
  assets: get('/assets/*path'),
  home: get('/'),
  issue: get('/letters/:issueId'),
  createLetter: post('/letters'),
  steve: route('steve', {
    index: get('/'),
    createIssue: post('/issues'),
    updateIssue: post('/issues/:issueId'),
    updateLetter: post('/letters/:letterId'),
  }),
})
