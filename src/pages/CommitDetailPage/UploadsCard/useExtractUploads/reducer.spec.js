import { renderHook } from '@testing-library/react-hooks'
import { useReducer } from 'react'

import { reducer } from './reducer'

const initialState = {
  sortedUploads: { a: 'abc' },
  uploadsProviderList: [1, 2, 3],
  uploadsOverview: 'asdf',
  erroredUploads: [4, 5, 6],
  hasNoUploads: true,
}

describe('useExtractUploads', () => {
  let hookData

  function setup() {
    hookData = renderHook(() => useReducer(reducer, initialState))
  }

  describe('reducer', () => {
    beforeEach(() => {
      setup()
    })

    it('returns default when uknown action is givven', () => {
      const [state, dispatch] = hookData.result.current
      dispatch({ type: 'randomType' })
      expect(state).toEqual(initialState)
    })
  })
})
