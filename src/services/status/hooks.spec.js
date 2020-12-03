import { renderHook, act } from '@testing-library/react-hooks'

import { useServerStatus, UNKNOWN, UP, DOWN, WARNING } from './hooks'

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
      expect(status).toBe(UNKNOWN)
    })
  })

  describe.each`
    serverStatus           | numWarning | expected
    ${UNKNOWN}             | ${0}       | ${UNKNOWN}
    ${UP}                  | ${0}       | ${UP}
    ${DOWN}                | ${0}       | ${DOWN}
    ${WARNING}             | ${0}       | ${WARNING}
    ${'not a real status'} | ${1}       | ${UNKNOWN}
    ${1231}                | ${1}       | ${UNKNOWN}
    ${{}}                  | ${1}       | ${UNKNOWN}
    ${[]}                  | ${1}       | ${UNKNOWN}
    ${null}                | ${1}       | ${UNKNOWN}
    ${undefined}           | ${1}       | ${UNKNOWN}
  `('Server status $serverStatus', ({ serverStatus, numWarning, expected }) => {
    let mockWarn
    beforeEach(() => {
      mockWarn = jest.fn()
      const spy = jest.spyOn(console, 'warn')
      spy.mockImplementation(mockWarn)

      setup()
    })

    it(`is updated to ${expected}`, () => {
      act(() => {
        const [, setStatus] = hookData.result.current
        setStatus(serverStatus)
      })

      const [status] = hookData.result.current
      expect(status).toBe(expected)
    })

    it(`will warn ${numWarning}`, () => {
      act(() => {
        const [, setStatus] = hookData.result.current
        setStatus(serverStatus)
      })

      const [status] = hookData.result.current
      expect(status).toBe(expected)
      expect(mockWarn).toHaveBeenCalledTimes(numWarning)
    })
  })
})
