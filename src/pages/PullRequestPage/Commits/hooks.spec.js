import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePullQuery } from 'generated'

import { useCompareCommits } from './hooks'

jest.mock('generated')

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
const data = { owner: { repository: { pull } } }

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
    usePullQuery.mockReturnValue({ data, isSuccess: true })
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
