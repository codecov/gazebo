import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'

import { useTableDefaultSort } from './useTableDefaultSort'

jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useTableDefaultSort', () => {
  describe('on initial render', () => {
    describe('no url parameters are set', () => {
      it('returns name ascending as default parameter', () => {
        useLocationParams.mockReturnValue({
          params: {},
        })
        const { result } = renderHook(() => useTableDefaultSort(), { wrapper })
        const state = result.current[0]

        expect(state).toEqual([{ id: 'name', desc: false }])
      })
    })

    describe('url parameter is set to tree', () => {
      it('returns name ascending', () => {
        useLocationParams.mockReturnValue({
          params: { displayType: 'tree' },
        })
        const { result } = renderHook(() => useTableDefaultSort(), { wrapper })
        const state = result.current[0]

        expect(state).toEqual([{ id: 'name', desc: false }])
      })
    })

    describe('url parameter is set to list', () => {
      it('returns misses descending', () => {
        useLocationParams.mockReturnValue({
          params: { displayType: 'list' },
        })
        const { result } = renderHook(() => useTableDefaultSort(), { wrapper })
        const state = result.current[0]

        expect(state).toEqual([{ id: 'misses', desc: true }])
      })
    })
  })

  describe('on further renders', () => {
    describe('url parameter is switched to tree', () => {
      it('returns misses ascending', async () => {
        useLocationParams
          .mockReturnValueOnce({
            params: { displayType: 'list' },
          })
          .mockReturnValue({
            params: { displayType: 'tree' },
          })

        const { result, rerender } = renderHook(() => useTableDefaultSort(), {
          wrapper,
        })

        rerender()

        const [state] = result.current

        expect(state).toEqual([{ id: 'name', desc: false }])
      })
    })

    describe('url parameter is switched to list', () => {
      it('returns names descending', async () => {
        useLocationParams
          .mockReturnValueOnce({
            params: { displayType: 'tree' },
          })
          .mockReturnValue({
            params: { displayType: 'list' },
          })

        const { result, rerender } = renderHook(() => useTableDefaultSort(), {
          wrapper,
        })

        rerender()

        const [state] = result.current

        expect(state).toEqual([{ id: 'misses', desc: true }])
      })
    })
  })
})
