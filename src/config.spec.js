import { removeReactAppPrefix } from 'config'

describe('config', () => {
  describe('removeReactAppPrefix', () => {
    it('removes REACT_APP prefix', () => {
      const obj = {
        REACT_APP_TEST_ENV: 'test env',
      }

      expect(removeReactAppPrefix(obj)).toEqual({ TEST_ENV: 'test env' })
    })

    describe('sets IS_ENTERPRISE to boolean', () => {
      it('sets to true', () => {
        const obj = {
          ENV: 'enterprise',
        }

        expect(removeReactAppPrefix(obj)).toEqual({
          ENV: 'enterprise',
          IS_ENTERPRISE: true,
        })
      })
      it('sets to false', () => {
        const obj = {
          ENV: 'production',
        }

        expect(removeReactAppPrefix(obj)).toEqual({
          ENV: 'production',
          IS_ENTERPRISE: false,
        })
      })
      it('sets skips if undefined', () => {
        const obj = {}

        expect(removeReactAppPrefix(obj)).toEqual({})
      })
    })
  })
})
