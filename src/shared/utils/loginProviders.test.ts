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
      expect(data).toMatch(/github-icon.svg/)
    })
  })

  describe('also fetches dark mode images', () => {
    it('returns string', () => {
      const data = loginProviderImage(LOGIN_PROVIDER_NAMES.gh, true)
      expect(data).toMatch(/github-icon-white.svg/)
    })
  })

  describe('invalid value is passed in', () => {
    describe('value is not in the object', () => {
      it('returns undefined', () => {
        const data = loginProviderImage('random value')
        expect(data).toBeUndefined()
      })
    })

    describe('passed value is undefined', () => {
      it('returns undefined', () => {
        const data = loginProviderImage()
        expect(data).toBeUndefined()
      })
    })
  })

  describe('is dark mode', () => {
    it('uses dark mode image', () => {
      const data = loginProviderImage(LOGIN_PROVIDER_NAMES.gh, true)
      expect(data).toMatch(/github-icon-white.svg/)
    })
  })
})

describe('loginProviderToName', () => {
  describe('valid value is passed', () => {
    it('returns the provider name', () => {
      const data = loginProviderToName(LOGIN_PROVIDER_SHORT_NAMES.gh)
      expect(data).toMatch(/GitHub/)
    })
  })

  describe('invalid value is passed in', () => {
    describe('value is not in object', () => {
      it('returns undefined', () => {
        const data = loginProviderToName('blah')
        expect(data).toBeUndefined()
      })
    })

    describe('value is undefined', () => {
      it('returns undefined', () => {
        const data = loginProviderToName()
        expect(data).toBeUndefined()
      })
    })
  })
})

describe('loginProviderToShortName', () => {
  describe('valid value is passed', () => {
    it('returns the provider name', () => {
      const data = loginProviderToShortName(LOGIN_PROVIDER_NAMES.github)
      expect(data).toMatch('gh')
    })
  })

  describe('invalid value is passed in', () => {
    describe('value is not in object', () => {
      it('returns undefined', () => {
        const data = loginProviderToShortName('blah')
        expect(data).toBeUndefined()
      })
    })

    describe('value is undefined', () => {
      it('returns undefined', () => {
        const data = loginProviderToShortName()
        expect(data).toBeUndefined()
      })
    })
  })
})
