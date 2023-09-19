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
      it('returns undefined', () => {
        const data = loginProviderImage('random value')
        expect(data).toBe(undefined)
      })
    })

    describe('passed value is undefined', () => {
      it('returns undefined', () => {
        const data = loginProviderImage()
        expect(data).toBe(undefined)
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
      it('returns undefined', () => {
        const data = loginProviderToName('blah')
        expect(data).toBe(undefined)
      })
    })

    describe('value is undefined', () => {
      it('returns undefined', () => {
        const data = loginProviderToName()
        expect(data).toBe(undefined)
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
      it('returns undefined', () => {
        const data = loginProviderToShortName('blah')
        expect(data).toBe(undefined)
      })
    })

    describe('value is undefined', () => {
      it('returns undefined', () => {
        const data = loginProviderToShortName()
        expect(data).toBe(undefined)
      })
    })
  })
})
