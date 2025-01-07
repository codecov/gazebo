import config from 'config'

import {
  getProviderCommitURL,
  getProviderPullURL,
  providerToInternalProvider,
  providerToName,
} from './provider'

vi.mock('config')

describe('providerToName', () => {
  describe('when called with gh', () => {
    it('returns Github', () => {
      expect(providerToName('gh')).toBe('GitHub')
    })
  })

  describe('when called with gl', () => {
    it('returns Gitlab', () => {
      expect(providerToName('gl')).toBe('GitLab')
    })
  })

  describe('when called with bb', () => {
    it('returns BitBucket', () => {
      expect(providerToName('bb')).toBe('BitBucket')
    })
  })

  describe('when called with ghe', () => {
    it('returns Github Enterprise', () => {
      expect(providerToName('ghe')).toBe('GitHub Enterprise')
    })
  })

  describe('when called with gle', () => {
    it('returns Gitlab Enterprise', () => {
      expect(providerToName('gle')).toBe('GitLab Enterprise')
    })
  })

  describe('when called with bbs', () => {
    it('returns BitBucket Server', () => {
      expect(providerToName('bbs')).toBe('BitBucket Server')
    })
  })

  describe('when called with Github', () => {
    it('returns Github', () => {
      expect(providerToName('github')).toBe('GitHub')
    })
  })

  describe('when called with Gitlab', () => {
    it('returns Gitlab', () => {
      expect(providerToName('gitlab')).toBe('GitLab')
    })
  })

  describe('when called with BitBucket', () => {
    it('returns BitBucket', () => {
      expect(providerToName('bitbucket')).toBe('BitBucket')
    })
  })

  describe('when called with github_enterprise', () => {
    it('returns Github Enterprise', () => {
      expect(providerToName('github_enterprise')).toBe('GitHub Enterprise')
    })
  })

  describe('when called with gitlab-enterprise', () => {
    it('returns Gitlab Enterprise', () => {
      expect(providerToName('gitlab_enterprise')).toBe('GitLab Enterprise')
    })
  })

  describe('when called with bitbucket_server', () => {
    it('returns BitBucket Server', () => {
      expect(providerToName('bitbucket_server')).toBe('BitBucket Server')
    })
  })
})

const repo = 'python'
const owner = 'codecov'
const commit = '12de'
const pullId = 12

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
  it('return ghe commit URL', () => {
    config.GHE_URL = 'https://github.mycompany.org'

    expect(getProviderCommitURL({ provider: 'ghe', owner, repo, commit })).toBe(
      'https://github.mycompany.org/codecov/python/commit/12de'
    )
  })
  it('return gitlab enterprise commit URL', () => {
    config.GLE_URL = 'https://gitlab.mycompany.org'

    expect(getProviderCommitURL({ provider: 'gle', owner, repo, commit })).toBe(
      'https://gitlab.mycompany.org/codecov/python/-/commit/12de'
    )
  })
  it('return bitbucket enterprise commit URL', () => {
    config.BBS_URL = 'https://bitbucket.mycompany.org'

    expect(getProviderCommitURL({ provider: 'bbs', owner, repo, commit })).toBe(
      'https://bitbucket.mycompany.org/codecov/python/commits/12de'
    )
  })
})

describe('getProviderPullURL', () => {
  it('return gitlab PR URL', () => {
    expect(getProviderPullURL({ provider: 'gl', owner, repo, pullId })).toBe(
      'https://gitlab.com/codecov/python/-/merge_requests/12'
    )
  })
  it('return github PR URL', () => {
    expect(getProviderPullURL({ provider: 'gh', owner, repo, pullId })).toBe(
      'https://github.com/codecov/python/pull/12'
    )
  })
  it('return bb PR URL', () => {
    expect(getProviderPullURL({ provider: 'bb', owner, repo, pullId })).toBe(
      'https://bitbucket.org/codecov/python/pull-requests/12'
    )
  })
  it('return ghe PR URL', () => {
    config.GHE_URL = 'https://github.mycompany.org'

    expect(getProviderPullURL({ provider: 'ghe', owner, repo, pullId })).toBe(
      'https://github.mycompany.org/codecov/python/pull/12'
    )
  })
  it('return gle PR URL', () => {
    config.GLE_URL = 'https://gitlab.mycompany.org'

    expect(getProviderPullURL({ provider: 'gle', owner, repo, pullId })).toBe(
      'https://gitlab.mycompany.org/codecov/python/-/merge_requests/12'
    )
  })
  it('return bbs PR URL', () => {
    config.BBS_URL = 'https://bitbucket.mycompany.org'

    expect(getProviderPullURL({ provider: 'bbs', owner, repo, pullId })).toBe(
      'https://bitbucket.mycompany.org/codecov/python/pull-requests/12'
    )
  })
})

describe('providerToInternalProvider', () => {
  describe('when called with gh', () => {
    it('returns github', () => {
      expect(providerToInternalProvider('gh')).toBe('github')
    })
  })

  describe('when called with gl', () => {
    it('returns gitlab', () => {
      expect(providerToInternalProvider('gl')).toBe('gitlab')
    })
  })

  describe('when called with bb', () => {
    it('returns bitbucket', () => {
      expect(providerToInternalProvider('bb')).toBe('bitbucket')
    })
  })

  describe('when called with ghe', () => {
    it('returns github_enterprise', () => {
      expect(providerToInternalProvider('ghe')).toBe('github_enterprise')
    })
  })

  describe('when called with gle', () => {
    it('returns gitlab_enterprise', () => {
      expect(providerToInternalProvider('gle')).toBe('gitlab_enterprise')
    })
  })

  describe('when called with bbs', () => {
    it('returns bitbucket_server', () => {
      expect(providerToInternalProvider('bbs')).toBe('bitbucket_server')
    })
  })

  describe('when called with Github', () => {
    it('returns github', () => {
      expect(providerToInternalProvider('github')).toBe('github')
    })
  })

  describe('when called with Gitlab', () => {
    it('returns gitlab', () => {
      expect(providerToInternalProvider('gitlab')).toBe('gitlab')
    })
  })

  describe('when called with BitBucket', () => {
    it('returns bitbucket', () => {
      expect(providerToInternalProvider('bitbucket')).toBe('bitbucket')
    })
  })

  describe('when called with github_enterprise', () => {
    it('returns github_enterprise', () => {
      expect(providerToInternalProvider('github_enterprise')).toBe(
        'github_enterprise'
      )
    })
  })

  describe('when called with gitlab-enterprise', () => {
    it('returns gitlab_enterprise', () => {
      expect(providerToInternalProvider('gitlab_enterprise')).toBe(
        'gitlab_enterprise'
      )
    })
  })

  describe('when called with bitbucket_server', () => {
    it('returns bitbucket_server', () => {
      expect(providerToInternalProvider('bitbucket_server')).toBe(
        'bitbucket_server'
      )
    })
  })
})
