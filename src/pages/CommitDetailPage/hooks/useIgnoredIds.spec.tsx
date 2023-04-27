import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'

import { useIgnoredIds } from './useIgnoredIds'

const queryClient = new QueryClient()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

afterEach(() => {
  queryClient.clear()
})

describe('useIgnoredIds', () => {
  it('returns an empty array when called', async () => {
    const { result, waitFor } = renderHook(() => useIgnoredIds(), { wrapper })

    await waitFor(() => expect(result.current.data).toStrictEqual([]))
  })
})
