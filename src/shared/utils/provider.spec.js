import { providerImage, providerToName } from './provider'

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

describe('providerImage',  () => {
    describe('when called for Github', () => {
        it('returns correct logo url', () => {
            expect(providerImage('Github')).toEqual('/logos/providers/github-icon.svg')
        })
    })
    describe('when called for Gitlab', () => {
        it('returns correct logo url', () => {
            expect(providerImage('Gitlab')).toEqual('/logos/providers/gitlab-icon.svg')
        })
    })
    describe('when called for BitBucket', () => {
        it('returns correct logo url', () => {
            expect(providerImage('BitBucket')).toEqual('/logos/providers/bitbucket-icon.svg')
        })
    })
})
