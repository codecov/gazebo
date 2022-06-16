import Cookie from 'js-cookie'

import config from 'config'

import { generatePath, getHeaders } from './helpers'

describe('generatePath', () => {
  it('generates a path without a query', () => {
    expect(generatePath({ path: '/epic' })).toStrictEqual(
      `${config.API_URL}/internal/epic`
    )
  })

  it('generates a path with a query', () => {
    expect(
      generatePath({ path: '/epic', query: { rocket: 'league' } })
    ).toStrictEqual(`${config.API_URL}/internal/epic?rocket=league`)
    expect(
      generatePath({ path: '/epic', query: { rocket: 'league', fort: 'nite' } })
    ).toStrictEqual(`${config.API_URL}/internal/epic?rocket=league&fort=nite`)
  })
})

describe('getHeaders', () => {
  beforeEach(() => {
    Cookie.set('github-token', 'github token')
    Cookie.set('gitlab-token', 'gitlab token')
    Cookie.set('bitbucket-token', 'bitbucket token')
  })

  afterEach(() => {
    Cookie.set('github-token')
    Cookie.set('gitlab-token')
    Cookie.set('bitbucket-token')
  })

  test.each([
    ['gh', 'github-token'],
    ['gl', 'gitlab-token'],
    ['bb', 'bitbucket-token'],
    ['github', 'github-token'],
    ['bitbucket', 'bitbucket-token'],
    ['gitlab', 'gitlab-token'],
    ['invalid', undefined],
  ])(
    'Passing %s as a provider creates the correct auth header',
    (provider, token) => {
      expect(getHeaders(provider)).toStrictEqual({
        Accept: 'application/json',
        'Token-Type': token,
      })
    }
  )

  it('returns baseHeader when no provider is given', () => {
    expect(getHeaders(undefined)).toStrictEqual({
      Accept: 'application/json',
    })
  })
})
