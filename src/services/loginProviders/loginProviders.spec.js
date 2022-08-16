import { LoginProvidersEnum } from './loginProviders'

describe('LoginProvidersEnum', () => {
  describe('GitHub', () => {
    it('returns the correct info', () => {
      const data = {
        provider: 'gh',
        name: 'GitHub',
        external: 'GITHUB',
        externalKey: 'gh',
        selfHosted: 'GITHUB_ENTERPRISE',
        selfHostedKey: 'ghe',
        selfHostedName: 'GitHub Enterprise',
        variant: 'github',
      }

      expect(data).toStrictEqual(LoginProvidersEnum.GITHUB)
    })
  })
  describe('GitLab', () => {
    it('returns the correct information', () => {
      const data = {
        provider: 'gl',
        name: 'GitLab',
        external: 'GITLAB',
        externalKey: 'gl',
        selfHosted: 'GITLAB_ENTERPRISE',
        selfHostedKey: 'gle',
        selfHostedName: 'GitLab CE/EE',
        variant: 'gitlab',
      }

      expect(data).toStrictEqual(LoginProvidersEnum.GITLAB)
    })
  })
  describe('Bitbucket', () => {
    it('returns the correct information', () => {
      const data = {
        provider: 'bb',
        name: 'Bitbucket',
        external: 'BITBUCKET',
        externalKey: 'bb',
        selfHosted: 'BITBUCKET_SERVER',
        selfHostedKey: 'bbs',
        selfHostedName: 'Bitbucket Server',
        variant: 'bitbucket',
      }

      expect(data).toStrictEqual(LoginProvidersEnum.BITBUCKET)
    })
  })
})
