import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useScrollToLine } from './useScrollToLine'

const scrollIntoViewMock = jest.fn()

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

describe('useScrollToLine', () => {
  let useRefSpy

  beforeEach(() => {
    useRefSpy = jest
      .spyOn(React, 'useRef')
      .mockReturnValue({ current: { scrollIntoView: scrollIntoViewMock } })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('calls scrollIntoView on load', async () => {
    renderHook(() => useScrollToLine({ number: 1, path: 'src/file.js' }), {
      wrapper,
    })

    expect(useRefSpy).toHaveBeenCalled()
    expect(scrollIntoViewMock).toHaveBeenCalled()
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })
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
    const { result } = renderHook(
      () => useScrollToLine({ number: 1, path: 'cool-hash', head: true }),
      {
        wrapper,
      }
    )

    expect(result.current.idString).toBe('#cool-hash-R1')
  })

  describe('base is passed to hook', () => {
    const { result } = renderHook(
      () => useScrollToLine({ number: 1, path: 'cool-hash', base: true }),
      {
        wrapper,
      }
    )

    expect(result.current.idString).toBe('#cool-hash-L1')
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

        result.current.handleClick()

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

        result.current.handleClick()

        expect(testLocation.hash).toBe(
          createIdString({ path: 'src/file.js', number: 2 })
        )
      })
    })
  })
})
