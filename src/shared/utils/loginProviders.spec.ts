import {
  LOGIN_PROVIDER_NAMES,
  LOGIN_PROVIDER_SHORT_NAMES,
  loginProviderImage,
  loginProviderToName,
  loginProviderToShortName,
} from './loginProviders'

describe('loginProviderImage', () => {
  describe('valid value is passed in', () => {
    it('returns string', () => {
      const data = loginProviderImage(LOGIN_PROVIDER_NAMES.gh)
      expect(data).toBe('github-icon.svg')
    })
  })

  describe('invalid value is passed in', () => {
    describe('value is not in the object', () => {
      it('returns null', () => {
        const data = loginProviderImage('random value')
        expect(data).toBe(null)
      })
    })

    describe('passed value is undefined', () => {
      it('returns null', () => {
        const data = loginProviderImage()
        expect(data).toBe(null)
      })
    })
  })
})

describe('loginProviderToName', () => {
  describe('valid value is passed', () => {
    it('returns the provider name', () => {
      const data = loginProviderToName(LOGIN_PROVIDER_SHORT_NAMES.gh)
      expect(data).toBe('Github')
    })
  })

  describe('invalid value is passed in', () => {
    describe('value is not in object', () => {
      it('returns null', () => {
        const data = loginProviderToName('blah')
        expect(data).toBe(null)
      })
    })

    describe('value is undefined', () => {
      it('returns null', () => {
        const data = loginProviderToName()
        expect(data).toBe(null)
      })
    })
  })
})

describe('loginProviderToShortName', () => {
  describe('valid value is passed', () => {
    it('returns the provider name', () => {
      const data = loginProviderToShortName(LOGIN_PROVIDER_NAMES.github)
      expect(data).toBe('gh')
    })
  })

  describe('invalid value is passed in', () => {
    describe('value is not in object', () => {
      it('returns null', () => {
        const data = loginProviderToShortName('blah')
        expect(data).toBe(null)
      })
    })

    describe('value is undefined', () => {
      it('returns null', () => {
        const data = loginProviderToShortName()
        expect(data).toBe(null)
      })
    })
  })
})
