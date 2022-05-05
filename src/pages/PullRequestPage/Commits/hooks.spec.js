import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePull } from 'services/pull'

import { useCompareCommits } from './hooks'

jest.mock('services/pull/hooks')

const pull = {
  pullId: 5,
  commits: {
    edges: [
      {
        node: {
          message: 'hi',
          author: { username: 'caleb' },
          commitid: '12345',
        },
      },
    ],
  },
}

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/caleb/mighty-nein/9']}>
    <Route path="/:provider/:owner/:repo/:pullId">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useCompareCommits', () => {
  let hookData

  function setup() {
    usePull.mockReturnValue({ data: pull, isSuccess: true })
    hookData = renderHook(() => useCompareCommits(), { wrapper })
  }

  beforeEach(() => {
    setup()
    return hookData.waitFor(() => hookData.result.current.isSuccess)
  })

  it('returns formats data accordingly', () => {
    expect(hookData.result.current.data).toEqual([
      { message: 'hi', author: 'caleb', commitid: '12345' },
    ])
  })
})
