import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'

import { useTableDefaultSort } from './useTableDefaultSort'

jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useTableDefaultSort', () => {
  it('returns returns name descending as default parameter if no url parameters are defined', () => {
    useLocationParams.mockReturnValue({
      params: {},
    })
    const { result } = renderHook(() => useTableDefaultSort(), { wrapper })
    const state = result.current[0]

    expect(state).toEqual([{ id: 'name', desc: false }])
  })

  it('returns returns name descending when url parameter is set to tree', () => {
    useLocationParams.mockReturnValue({
      params: { displayType: 'tree' },
    })
    const { result } = renderHook(() => useTableDefaultSort(), { wrapper })
    const state = result.current[0]

    expect(state).toEqual([{ id: 'name', desc: false }])
  })

  it('returns returns misses ascending when url parameter is set to list', () => {
    useLocationParams.mockReturnValue({
      params: { displayType: 'list' },
    })
    const { result } = renderHook(() => useTableDefaultSort(), { wrapper })
    const state = result.current[0]

    expect(state).toEqual([{ id: 'misses', desc: true }])
  })
})
