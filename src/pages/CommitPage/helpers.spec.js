import { getProviderCommitURL, getProviderPullURL } from './helpers'

describe('getProviderCommitURL', () => {
  it('return gitlab commit URL', () => {
    expect(getProviderCommitURL('gl', 'codecov', 'python')).toBe(
      'https://gitlab.com/codecov/python/-/commit'
    )
  })
  it('return github commit URL', () => {
    expect(getProviderCommitURL('gh', 'codecov', 'python')).toBe(
      'https://github.com/codecov/python/commit'
    )
  })
  it('return bb commit URL', () => {
    expect(getProviderCommitURL('bb', 'codecov', 'python')).toBe(
      'https://bitbucket.org/codecov/python/commits'
    )
  })
})

describe('getProviderPullURL', () => {
  it('return gitlab PR URL', () => {
    expect(getProviderPullURL('gl', 'codecov', 'python')).toBe(
      'https://gitlab.com/codecov/python/-/merge_requests'
    )
  })
  it('return github PR URL', () => {
    expect(getProviderPullURL('gh', 'codecov', 'python')).toBe(
      'https://github.com/codecov/python/pull'
    )
  })
  it('return bb PR URL', () => {
    expect(getProviderPullURL('bb', 'codecov', 'python')).toBe(
      'https://bitbucket.org/codecov/python/pull-requests'
    )
  })
})
