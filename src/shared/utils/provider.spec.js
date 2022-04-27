import {
  getProviderCommitURL,
  getProviderPullURL,
  providerImage,
  providerToName,
} from './provider'

describe('providerToName', () => {
  describe('when called with gh', () => {
    it('returns Github', () => {
      expect(providerToName('gh')).toBe('Github')
    })
  })

  describe('when called with gl', () => {
    it('returns Gitlab', () => {
      expect(providerToName('gl')).toBe('Gitlab')
    })
  })

  describe('when called with bb', () => {
    it('returns BitBucket', () => {
      expect(providerToName('bb')).toBe('BitBucket')
    })
  })
  describe('when called with Github', () => {
    it('returns Github', () => {
      expect(providerToName('Github')).toBe('Github')
    })
  })

  describe('when called with Gitlab', () => {
    it('returns Gitlab', () => {
      expect(providerToName('Gitlab')).toBe('Gitlab')
    })
  })

  describe('when called with BitBucket', () => {
    it('returns BitBucket', () => {
      expect(providerToName('BitBucket')).toBe('BitBucket')
    })
  })
})

describe('providerImage', () => {
  describe('when called for Github', () => {
    it('returns correct logo url', () => {
      expect(providerImage('Github')).toEqual('github-icon.svg')
    })
  })
  describe('when called for Gitlab', () => {
    it('returns correct logo url', () => {
      expect(providerImage('Gitlab')).toEqual('gitlab-icon.svg')
    })
  })
  describe('when called for BitBucket', () => {
    it('returns correct logo url', () => {
      expect(providerImage('BitBucket')).toEqual('bitbucket-icon.svg')
    })
  })
})

const repo = 'python'
const owner = 'codecov'
const commit = '12de'
const pullId = 'aebf'

describe('getProviderCommitURL', () => {
  it('return gitlab commit URL', () => {
    expect(getProviderCommitURL({ provider: 'gl', owner, repo, commit })).toBe(
      'https://gitlab.com/codecov/python/-/commit/12de'
    )
  })
  it('return github commit URL', () => {
    expect(getProviderCommitURL({ provider: 'gh', owner, repo, commit })).toBe(
      'https://github.com/codecov/python/commit/12de'
    )
  })
  it('return bb commit URL', () => {
    expect(getProviderCommitURL({ provider: 'bb', owner, repo, commit })).toBe(
      'https://bitbucket.org/codecov/python/commits/12de'
    )
  })
})

describe('getProviderPullURL', () => {
  it('return gitlab PR URL', () => {
    expect(getProviderPullURL({ provider: 'gl', owner, repo, pullId })).toBe(
      'https://gitlab.com/codecov/python/-/merge_requests/aebf'
    )
  })
  it('return github PR URL', () => {
    expect(getProviderPullURL({ provider: 'gh', owner, repo, pullId })).toBe(
      'https://github.com/codecov/python/pull/aebf'
    )
  })
  it('return bb PR URL', () => {
    expect(getProviderPullURL({ provider: 'bb', owner, repo, pullId })).toBe(
      'https://bitbucket.org/codecov/python/pull-requests/aebf'
    )
  })
})
