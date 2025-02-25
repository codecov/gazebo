import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useTableDefaultSort } from './useTableDefaultSort'

const mocks = vi.hoisted(() => ({
  useLocationParams: vi.fn(),
}))

vi.mock('services/navigation/useLocationParams', async () => {
  const originalModule = await vi.importActual(
    'services/navigation/useLocationParams'
  )
  return {
    ...originalModule,
    useLocationParams: mocks.useLocationParams,
  }
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
        mocks.useLocationParams.mockReturnValue({
          params: {},
        })
        const { result } = renderHook(() => useTableDefaultSort(), { wrapper })
        const state = result.current[0]

        expect(state).toEqual([{ id: 'name', desc: false }])
      })
    })

    describe('url parameter is set to tree', () => {
      it('returns name ascending', () => {
        mocks.useLocationParams.mockReturnValue({
          params: { displayType: 'tree' },
        })
        const { result } = renderHook(() => useTableDefaultSort(), { wrapper })
        const state = result.current[0]

        expect(state).toEqual([{ id: 'name', desc: false }])
      })
    })

    describe('url parameter is set to list', () => {
      it('returns misses descending', () => {
        mocks.useLocationParams.mockReturnValue({
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
        mocks.useLocationParams
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
        mocks.useLocationParams
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
