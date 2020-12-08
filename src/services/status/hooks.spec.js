import { renderHook } from '@testing-library/react-hooks'

import { useServerStatus } from './hooks'

describe('useServerStatus', () => {
  let hookData

  function setup() {
    hookData = renderHook(() => useServerStatus())
  }

  describe('status returns by default', () => {
    beforeEach(() => {
      setup()
    })

    it('has default', () => {
      const [status] = hookData.result.current
      expect(status).toBe('up')
    })
  })
})
