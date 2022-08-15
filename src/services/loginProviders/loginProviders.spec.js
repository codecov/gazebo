import { getCurrentProvider, LoginProvidersEnum } from './loginProviders'

describe('getCurrentProvider', () => {
  describe('bitbucket is the provider', () => {
    it('returns Bitbucket info', () => {
      const data = getCurrentProvider('bb')
      expect(data).toEqual(LoginProvidersEnum.BITBUCKET)
    })
  })
  describe('github is the provider', () => {
    it('returns GitHub info', () => {
      const data = getCurrentProvider('gh')
      expect(data).toEqual(LoginProvidersEnum.GITHUB)
    })
  })
  describe('gitlab is the provider', () => {
    it('returns GitLab info', () => {
      const data = getCurrentProvider('gl')
      expect(data).toEqual(LoginProvidersEnum.GITLAB)
    })
  })
  describe('no provider found', () => {
    it('returns null', () => {
      const data = getCurrentProvider('unknown')
      expect(data).toBeNull()
    })
  })
})
