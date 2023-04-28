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
  describe('reducer', () => {
    it('returns default when uknown action is givven', () => {
      const { result } = renderHook(() => useReducer(reducer, initialState))
      const [state, dispatch] = result.current
      dispatch({ type: 'randomType' })
      expect(state).toEqual(initialState)
    })
  })
})
