import Cookie from 'js-cookie'

import config from 'config'

import { generatePath, getHeaders, rejectNetworkErrorToSentry } from './helpers'

const mocks = vi.hoisted(() => ({
  withScope: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureMessage: vi.fn(),
  setFingerprint: vi.fn(),
}))

vi.mock('@sentry/react', async () => {
  const actual = await vi.importActual('@sentry/react')
  return {
    ...actual,
    withScope: mocks.withScope.mockImplementation((fn) =>
      fn({
        addBreadcrumb: mocks.addBreadcrumb,
        setFingerprint: mocks.setFingerprint,
        captureMessage: mocks.captureMessage,
      })
    ),
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

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

describe('rejectNetworkErrorToSentry', () => {
  describe('when the error has a dev message and error', () => {
    it('adds a breadcrumb', () => {
      rejectNetworkErrorToSentry({
        status: 404,
        data: {},
        dev: 'useCoolHook - 404 not found',
        error: Error('not found'),
      }).catch((e) => {})

      expect(mocks.addBreadcrumb).toHaveBeenCalledWith({
        category: 'network.error',
        level: 'error',
        data: Error('not found'),
      })
    })

    it('sets the fingerprint', () => {
      rejectNetworkErrorToSentry({
        status: 404,
        data: {},
        dev: 'useCoolHook - 404 not found',
        error: Error('not found'),
      }).catch((e) => {})

      expect(mocks.setFingerprint).toHaveBeenCalledWith([
        'useCoolHook - 404 not found',
      ])
    })

    it('captures the error with Sentry', () => {
      rejectNetworkErrorToSentry({
        status: 404,
        data: {},
        dev: 'useCoolHook - 404 not found',
        error: Error('not found'),
      }).catch((e) => {})

      expect(mocks.captureMessage).toHaveBeenCalledWith('Network Error')
    })
  })

  describe('when the error does not have an error', () => {
    it('does not call any Sentry methods', () => {
      rejectNetworkErrorToSentry({
        status: 404,
        data: {},
        dev: 'useCoolHook - 404 not found',
      }).catch((e) => {})

      expect(mocks.addBreadcrumb).not.toHaveBeenCalled()
      expect(mocks.setFingerprint).not.toHaveBeenCalled()
      expect(mocks.captureMessage).not.toHaveBeenCalled()
    })
  })
})
