import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCommits } from 'services/commits'

import { usePullPageData } from './usePullPageData'
import { useTabsCounts } from './useTabsCounts'

jest.mock('services/commits')
jest.mock('./usePullPageData')

const mockPullData = {
  pull: {
    pullId: 1,
    compareWithBase: {
      impactedFilesCount: 2,
      indirectChangedFilesCount: 3,
      flagComparisonsCount: 1,
      __typename: 'Comparison',
    },
  },
}

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useTabsCount', () => {
  function setup() {
    useCommits.mockReturnValue({ data: { commitsCount: 4 } })
    usePullPageData.mockReturnValue({ data: mockPullData })
  }

  describe('calling hook', () => {
    beforeEach(() => {
      setup()
    })

    it('returns the correct data', async () => {
      const { result } = renderHook(() => useTabsCounts(), {
        wrapper,
      })

      expect(result.current).toStrictEqual({
        flagsCount: 1,
        impactedFilesCount: 2,
        indirectChangesCount: 3,
        commitsCount: 4,
      })
    })
  })
})
