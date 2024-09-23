import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useScrollToLine } from './useScrollToLine'

const mockScrollIntoViewMock = vi.fn()
const mockScrollTo = vi.fn()

const createIdString = ({ path, number }) => `#${path}-L${number}`

let testLocation
const wrapper = ({ children }) => (
  <MemoryRouter
    initialEntries={[
      `/gh/codecov/cool-repo/src/file.js${createIdString({
        path: 'src/file.js',
        number: 1,
      })}`,
    ]}
  >
    <Route path="/:provider/:owner/:repo/:path+">{children}</Route>
    <Route
      path="*"
      render={({ location }) => {
        testLocation = location
        return null
      }}
    />
  </MemoryRouter>
)

class ResizeObserverMock {
  callback = null

  constructor(callback) {
    this.callback = callback
  }

  observe() {
    this.callback()
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}

global.window.ResizeObserver = ResizeObserverMock

const mocks = vi.hoisted(() => ({
  useRef: vi.fn().mockImplementation(() => ({ current: false })),
}))

vi.mock('react', async () => {
  const original = await vi.importActual('react')

  return {
    ...original,
    useRef: mocks.useRef,
  }
})

describe('useScrollToLine', () => {
  beforeEach(() => {
    Object.defineProperty(global.window, 'scrollTo', { value: mockScrollTo })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('stickyPadding is not set', () => {
    it('calls scrollIntoView on load', async () => {
      mocks.useRef.mockImplementation(() => ({
        current: { scrollIntoView: mockScrollIntoViewMock },
      }))

      renderHook(() => useScrollToLine({ number: 1, path: 'src/file.js' }), {
        wrapper,
      })

      expect(mocks.useRef).toHaveBeenCalled()
      expect(mockScrollIntoViewMock).toHaveBeenCalled()
      expect(mockScrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
      })
    })

    describe('no path, base, or head is passed', () => {
      it('returns just the line number', () => {
        const { result } = renderHook(() => useScrollToLine({ number: 1 }), {
          wrapper,
        })

        expect(result.current.idString).toBe('#L1')
      })
    })

    describe('path is passed to hook', () => {
      it('adds path to id string', () => {
        const { result } = renderHook(
          () => useScrollToLine({ number: 1, path: 'cool-hash' }),
          {
            wrapper,
          }
        )

        expect(result.current.idString).toBe('#cool-hash-L1')
      })
    })

    describe('head is passed to hook', () => {
      it('sets head hash', () => {
        const { result } = renderHook(
          () => useScrollToLine({ number: 1, path: 'cool-hash', head: true }),
          {
            wrapper,
          }
        )

        expect(result.current.idString).toBe('#cool-hash-R1')
      })
    })

    describe('base is passed to hook', () => {
      it('sets base hash', () => {
        const { result } = renderHook(
          () => useScrollToLine({ number: 1, path: 'cool-hash', base: true }),
          {
            wrapper,
          }
        )

        expect(result.current.idString).toBe('#cool-hash-L1')
      })
    })

    describe('testing on click handler', () => {
      describe('clicking on the same number', () => {
        it('removes the location hash', () => {
          const { result } = renderHook(
            () => useScrollToLine({ number: 1, path: 'src/file.js' }),
            {
              wrapper,
            }
          )

          act(() => {
            result.current.handleClick()
          })

          expect(testLocation.hash).toBe('')
        })
      })

      describe('clicking on new number', () => {
        it('updates the location hash', () => {
          const { result } = renderHook(
            () => useScrollToLine({ number: 2, path: 'src/file.js' }),
            {
              wrapper,
            }
          )

          act(() => {
            result.current.handleClick()
          })

          expect(testLocation.hash).toBe(
            createIdString({ path: 'src/file.js', number: 2 })
          )
        })
      })
    })
  })

  describe('stickyPadding is set', () => {
    it('calls scrollTo on load', async () => {
      renderHook(
        () =>
          useScrollToLine({
            number: 1,
            path: 'src/file.js',
            stickyPadding: 10,
          }),
        {
          wrapper,
        }
      )

      expect(mockScrollTo).toHaveBeenCalled()
    })
  })
})
