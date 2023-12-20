import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { usePlanParams } from './usePlanParams'

describe('usePlanParams', () => {
  describe('there is a plan search param', () => {
    it('returns the plan value', () => {
      const { result } = renderHook(() => usePlanParams(), {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={['/test?plan=team']}>
            {children}
          </MemoryRouter>
        ),
      })

      expect(result.current).toEqual('team')
    })
  })

  describe('there is no plan search param', () => {
    describe('there are other search params', () => {
      it('returns null', () => {
        const { result } = renderHook(() => usePlanParams(), {
          wrapper: ({ children }) => (
            <MemoryRouter initialEntries={['/test?test=params']}>
              {children}
            </MemoryRouter>
          ),
        })

        expect(result.current).toBeNull()
      })
    })

    describe('there are no search params', () => {
      it('returns null', () => {
        const { result } = renderHook(() => usePlanParams(), {
          wrapper: ({ children }) => (
            <MemoryRouter initialEntries={['/test']}>{children}</MemoryRouter>
          ),
        })

        expect(result.current).toBeNull()
      })
    })
  })
})
