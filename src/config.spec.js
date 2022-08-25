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
          REACT_APP_IS_ENTERPRISE: 'true',
        }

        expect(removeReactAppPrefix(obj)).toEqual({ IS_ENTERPRISE: true })
      })
      it('sets to false', () => {
        const obj = {
          REACT_APP_IS_ENTERPRISE: 'false',
        }

        expect(removeReactAppPrefix(obj)).toEqual({ IS_ENTERPRISE: false })
      })
    })
  })
})
