import { getProviderCommitURL, getProviderPullURL } from './helpers'

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
