import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'

import { IgnoredIdsQueryOptions } from './IgnoredIdsQueryOptions'

const queryClientV5 = new QueryClientV5()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    {children}
  </QueryClientProviderV5>
)

afterEach(() => {
  queryClientV5.clear()
})

describe('IgnoredIdsQueryOptions', () => {
  it('sets the initial data to an empty array', async () => {
    const { result } = renderHook(() => useQueryV5(IgnoredIdsQueryOptions()), {
      wrapper,
    })

    await waitFor(() => expect(result.current.data).toStrictEqual([]))
  })

  it('returns an empty array when called a second time', async () => {
    const { result } = renderHook(() => useQueryV5(IgnoredIdsQueryOptions()), {
      wrapper,
    })

    await waitFor(() => expect(result.current.data).toStrictEqual([]))

    result.current.refetch()

    await waitFor(() => expect(result.current.data).toStrictEqual([]))
  })
})
