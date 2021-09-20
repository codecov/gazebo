import { snakeifyKeys, getHeaders, generatePath } from './helpers'
import Cookie from 'js-cookie'

import config from 'config'
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

describe('snakeifyKeys', () => {
  it('converts an object from CamelCast to SnakeCase', () => {
    expect(snakeifyKeys({ fooBar: 1, bizBaz: 3 })).toStrictEqual({
      foo_bar: 1,
      biz_baz: 3,
    })
  })

  it('else passes through', () => {
    expect(snakeifyKeys([1, 2, 3])).toStrictEqual([1, 2, 3])
    expect(snakeifyKeys(1)).toStrictEqual(1)
    expect(snakeifyKeys('test')).toStrictEqual('test')
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
