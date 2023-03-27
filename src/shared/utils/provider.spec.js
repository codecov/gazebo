import {
  getProviderCommitURL,
  getProviderPullURL,
  providerFeedback,
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

  describe('when called with ghe', () => {
    it('returns Github Enterprise', () => {
      expect(providerToName('ghe')).toBe('Github Enterprise')
    })
  })

  describe('when called with gle', () => {
    it('returns Gitlab Enterprise', () => {
      expect(providerToName('gle')).toBe('Gitlab Enterprise')
    })
  })

  describe('when called with bbs', () => {
    it('returns BitBucket Server', () => {
      expect(providerToName('bbs')).toBe('BitBucket Server')
    })
  })

  describe('when called with Github', () => {
    it('returns Github', () => {
      expect(providerToName('github')).toBe('Github')
    })
  })

  describe('when called with Gitlab', () => {
    it('returns Gitlab', () => {
      expect(providerToName('gitlab')).toBe('Gitlab')
    })
  })

  describe('when called with BitBucket', () => {
    it('returns BitBucket', () => {
      expect(providerToName('BitBucket')).toBe('BitBucket')
    })
  })

  describe('when called with github_enterprise', () => {
    it('returns Github Enterprise', () => {
      expect(providerToName('github_enterprise')).toBe('Github Enterprise')
    })
  })

  describe('when called with gitlab-enterprise', () => {
    it('returns Gitlab Enterprise', () => {
      expect(providerToName('gitlab_enterprise')).toBe('Gitlab Enterprise')
    })
  })

  describe('when called with bitbucket_server', () => {
    it('returns BitBucket Server', () => {
      expect(providerToName('bitbucket_server')).toBe('BitBucket Server')
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
  describe('when called for Github Enterprise', () => {
    it('returns correct logo url', () => {
      expect(providerImage('github_enterprise')).toEqual('github-icon.svg')
    })
  })
  describe('when called for Gitlab Enterprise', () => {
    it('returns correct logo url', () => {
      expect(providerImage('gitlab_enterprise')).toEqual('gitlab-icon.svg')
    })
  })
  describe('when called for BitBucket Server', () => {
    it('returns correct logo url', () => {
      expect(providerImage('bitbucket_server')).toEqual('bitbucket-icon.svg')
    })
  })
})

describe('providerFeedback', () => {
  describe('when called for Github', () => {
    it('returns correct url', () => {
      expect(providerFeedback('Github')).toEqual(
        'https://github.com/codecov/Codecov-user-feedback/issues/1'
      )
    })
  })
  describe('when called for Gitlab', () => {
    it('returns correct url', () => {
      expect(providerFeedback('Gitlab')).toEqual(
        'https://gitlab.com/codecov-open-source/codecov-user-feedback/-/issues/1'
      )
    })
  })
  describe('when called for BitBucket', () => {
    it('returns correct url', () => {
      expect(providerFeedback('BitBucket')).toEqual(
        'https://bitbucket.org/kylemann/codecov/issues/1/wed-love-your-feedback'
      )
    })
  })
  describe('when called for Github Enterprise', () => {
    it('returns correct url', () => {
      expect(providerFeedback('github_enterprise')).toEqual(
        'https://github.com/codecov/Codecov-user-feedback/issues/1'
      )
    })
  })
  describe('when called for Gitlab Enterprise', () => {
    it('returns correct url', () => {
      expect(providerFeedback('gitlab_enterprise')).toEqual(
        'https://gitlab.com/codecov-open-source/codecov-user-feedback/-/issues/1'
      )
    })
  })
  describe('when called for BitBucket Server', () => {
    it('returns correct url', () => {
      expect(providerFeedback('bitbucket_server')).toEqual(
        'https://bitbucket.org/kylemann/codecov/issues/1/wed-love-your-feedback'
      )
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
