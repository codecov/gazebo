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
    Cookie.set('github_enterprise-token', 'github-enterprise token')
    Cookie.set('gitlab_enterprise-token', 'gitlab-enterprise token')
    Cookie.set('bitbucket_server-token', 'bitbucket-server token')
  })

  afterEach(() => {
    Cookie.set('github-token', '')
    Cookie.set('gitlab-token', '')
    Cookie.set('bitbucket-token', '')
    Cookie.set('github_enterprise-token', '')
    Cookie.set('gitlab_enterprise-token', '')
    Cookie.set('bitbucket_server-token', '')
  })

  describe.each([
    ['gh', 'github-token'],
    ['gl', 'gitlab-token'],
    ['bb', 'bitbucket-token'],
    ['ghe', 'github_enterprise-token'],
    ['gle', 'gitlab_enterprise-token'],
    ['bbs', 'bitbucket_server-token'],
    ['github', 'github-token'],
    ['bitbucket', 'bitbucket-token'],
    ['gitlab', 'gitlab-token'],
    ['github_enterprise', 'github_enterprise-token'],
    ['gitlab_enterprise', 'gitlab_enterprise-token'],
    ['bitbucket_server', 'bitbucket_server-token'],
  ])('Passing %s as a provider', (provider, token) => {
    it('returns the correct header', () => {
      expect(getHeaders(provider)).toStrictEqual({
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Token-Type': token,
      })
    })
  })

  it('returns baseHeader when invalid provider is given', () => {
    expect(getHeaders('invalid')).toStrictEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    })
  })

  it('returns baseHeader when no provider is given', () => {
    expect(getHeaders(undefined)).toStrictEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    })
  })
})
