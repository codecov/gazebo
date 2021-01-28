import { providerToName } from './provider'

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
})
