import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { useIgnoredIds } from './useIgnoredIds'

const queryClient = new QueryClient()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

afterEach(() => {
  queryClient.clear()
})

describe('useIgnoredIds', () => {
  it('sets the initial data to an empty array', async () => {
    const { result } = renderHook(() => useIgnoredIds(), { wrapper })

    await waitFor(() => expect(result.current.data).toStrictEqual([]))
  })
  it('returns an empty array when called a second time', async () => {
    const { result } = renderHook(() => useIgnoredIds(), { wrapper })

    await waitFor(() => expect(result.current.data).toStrictEqual([]))

    result.current.refetch()

    await waitFor(() => expect(result.current.data).toStrictEqual([]))
  })
})
