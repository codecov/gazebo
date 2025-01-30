import { removeReactAppPrefix } from 'config'

describe('config', () => {
  describe('removeReactAppPrefix', () => {
    it('removes REACT_APP prefix', () => {
      const obj = { REACT_APP_TEST_ENV: 'test env' }

      expect(removeReactAppPrefix(obj)).toEqual({ TEST_ENV: 'test env' })
    })

    describe('sets IS_SELF_HOSTED to boolean', () => {
      it('sets to true', () => {
        const obj = { ENV: 'enterprise' }

        expect(removeReactAppPrefix(obj)).toEqual({
          ENV: 'enterprise',
          IS_SELF_HOSTED: true,
        })
      })

      it('sets to false', () => {
        const obj = { ENV: 'production' }

        expect(removeReactAppPrefix(obj)).toEqual({
          ENV: 'production',
          IS_SELF_HOSTED: false,
        })
      })

      it('sets skips if undefined', () => {
        const obj = {}

        expect(removeReactAppPrefix(obj)).toEqual({})
      })
    })

    describe('sets HIDE_ACCESS_TAB to boolean', () => {
      it('sets to true', () => {
        const obj = {
          HIDE_ACCESS_TAB: 'true',
        }

        expect(removeReactAppPrefix(obj)).toEqual({
          HIDE_ACCESS_TAB: true,
        })
      })

      it('sets to false', () => {
        const obj = {
          HIDE_ACCESS_TAB: 'false',
        }

        expect(removeReactAppPrefix(obj)).toEqual({
          HIDE_ACCESS_TAB: false,
        })
      })

      it('sets skips if undefined', () => {
        const obj = {}

        expect(removeReactAppPrefix(obj)).toEqual({})
      })
    })

    describe('sets SUNBURST_ENABLED to boolean', () => {
      it('sets to true', () => {
        const obj = { SUNBURST_ENABLED: 'true' }

        expect(removeReactAppPrefix(obj)).toEqual({ SUNBURST_ENABLED: true })
      })
    })

    describe('sets DISPLAY_SELF_HOSTED_EXPIRATION_BANNER to boolean', () => {
      it('sets to true', () => {
        const obj = { DISPLAY_SELF_HOSTED_EXPIRATION_BANNER: 'true' }

        expect(removeReactAppPrefix(obj)).toEqual({
          DISPLAY_SELF_HOSTED_EXPIRATION_BANNER: true,
        })
      })
    })

    describe('sets IS_DEDICATED_NAMESPACE to boolean', () => {
      it('sets to true', () => {
        const obj = {
          IS_DEDICATED_NAMESPACE: 'true',
        }

        expect(removeReactAppPrefix(obj)).toEqual({
          IS_DEDICATED_NAMESPACE: true,
        })
      })

      it('sets to false', () => {
        const obj = {
          IS_DEDICATED_NAMESPACE: 'false',
        }

        expect(removeReactAppPrefix(obj)).toEqual({
          IS_DEDICATED_NAMESPACE: false,
        })
      })

      it('sets skips if undefined', () => {
        const obj = {}

        expect(removeReactAppPrefix(obj)).toEqual({})
      })
    })

    describe('sets SENTRY_TRACING_SAMPLE_RATE to float', () => {
      it('sets to float', () => {
        const obj = {
          SENTRY_TRACING_SAMPLE_RATE: '0.1',
        }

        const returnObj = removeReactAppPrefix(obj)
        expect(returnObj).toEqual({ SENTRY_TRACING_SAMPLE_RATE: 0.1 })
      })
    })

    describe('sets SENTRY_SESSION_SAMPLE_RATE to float', () => {
      it('sets to float', () => {
        const obj = {
          SENTRY_SESSION_SAMPLE_RATE: '0.1',
        }

        const returnObj = removeReactAppPrefix(obj)
        expect(returnObj).toEqual({ SENTRY_SESSION_SAMPLE_RATE: 0.1 })
      })
    })

    describe('sets SENTRY_ERROR_SAMPLE_RATE to float', () => {
      it('sets to float', () => {
        const obj = {
          SENTRY_ERROR_SAMPLE_RATE: '0.1',
        }

        const returnObj = removeReactAppPrefix(obj)
        expect(returnObj).toEqual({ SENTRY_ERROR_SAMPLE_RATE: 0.1 })
      })
    })
  })
})
