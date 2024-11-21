import { renderHook } from '@testing-library/react'

import { useTruncation } from './useTruncation'

let entry: {} | undefined = {}
class ResizeObserver {
  callback = (_x: any) => null

  constructor(callback: any) {
    this.callback = callback
  }

  observe() {
    this.callback([entry])
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}

global.window.ResizeObserver = ResizeObserver

const mocks = vi.hoisted(() => ({
  useRef: vi.fn(),
}))

vi.mock('react', async () => {
  const original = await vi.importActual('react')

  return {
    ...original,
    useRef: mocks.useRef,
  }
})

describe('useTruncation', () => {
  function setup({
    clientHeight = 0,
    scrollHeight = 0,
    clientWidth = 0,
    scrollWidth = 0,
    enableEntry = true,
    nullRef = false,
  }) {
    const refReturn = nullRef
      ? { current: null }
      : {
          current: {
            clientHeight,
            scrollHeight,
            clientWidth,
            scrollWidth,
          },
        }

    mocks.useRef.mockReturnValue(refReturn)

    if (enableEntry) {
      entry = {
        target: {
          clientHeight,
          scrollHeight,
          clientWidth,
          scrollWidth,
        },
      }
    } else {
      entry = undefined
    }
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('scrolls are larger then clients', () => {
    describe('both scrolls are larger', () => {
      it('returns canTruncate to be true', () => {
        setup({ scrollHeight: 10, scrollWidth: 10 })
        const { result } = renderHook(() => useTruncation())

        expect(mocks.useRef).toHaveBeenCalled()
        expect(result.current.canTruncate).toBeTruthy()
      })
    })

    describe('height scroll is larger', () => {
      it('returns canTruncate to be true', () => {
        setup({ scrollHeight: 10, scrollWidth: 0 })
        const { result } = renderHook(() => useTruncation())

        expect(mocks.useRef).toHaveBeenCalled()
        expect(result.current.canTruncate).toBeTruthy()
      })
    })

    describe('width scroll is larger', () => {
      it('returns canTruncate to be true', () => {
        setup({ scrollHeight: 0, scrollWidth: 10 })
        const { result } = renderHook(() => useTruncation())

        expect(mocks.useRef).toHaveBeenCalled()
        expect(result.current.canTruncate).toBeTruthy()
      })
    })
  })

  describe('scrolls are smaller then clients', () => {
    describe('both scrolls are smaller', () => {
      it('returns canTruncate to be false', () => {
        setup({ clientHeight: 10, clientWidth: 10 })
        const { result } = renderHook(() => useTruncation())

        expect(mocks.useRef).toHaveBeenCalled()
        expect(result.current.canTruncate).toBeFalsy()
      })
    })

    describe('height scroll is larger', () => {
      it('returns canTruncate to be false', () => {
        setup({ clientHeight: 10, clientWidth: 0 })
        const { result } = renderHook(() => useTruncation())

        expect(mocks.useRef).toHaveBeenCalled()
        expect(result.current.canTruncate).toBeFalsy()
      })
    })

    describe('width scroll is larger', () => {
      it('returns canTruncate to be false', () => {
        setup({ clientHeight: 0, clientWidth: 10 })
        const { result } = renderHook(() => useTruncation())

        expect(mocks.useRef).toHaveBeenCalled()
        expect(result.current.canTruncate).toBeFalsy()
      })
    })
  })

  describe('element is not found in entries', () => {
    it('returns canTruncate is false', () => {
      setup({ scrollHeight: 10, scrollWidth: 10, enableEntry: false })

      const { result } = renderHook(() => useTruncation())

      expect(result.current.canTruncate).toBeFalsy()
    })
  })

  describe('element from ref is found to be null', () => {
    it('returns canTruncate is false', () => {
      setup({ scrollHeight: 10, scrollWidth: 10, nullRef: true })

      const { result } = renderHook(() => useTruncation())

      expect(result.current.canTruncate).toBeFalsy()
    })
  })
})
