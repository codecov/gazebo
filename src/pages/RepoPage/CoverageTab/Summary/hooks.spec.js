import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoCoverage, useRepoOverview } from 'services/repo'

import { useSummary } from './hooks'

jest.mock('services/repo')

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/caleb/mighty-nein']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useSummary', () => {
  let hookData

  function setup({ useRepoOverviewMock = {}, useRepoCoverageMock = {} }) {
    useRepoOverview.mockReturnValue(useRepoOverviewMock)
    useRepoCoverage.mockReturnValue(useRepoCoverageMock)

    hookData = renderHook(() => useSummary(), { wrapper })
  }

  describe('both services are pending', () => {
    beforeEach(() => {
      setup({
        useRepoOverviewMock: { data: {}, isLoading: true },
        useRepoCoverageMock: { data: {}, isLoading: true },
      })
    })

    it('isLoading is correct', () => {
      expect(hookData.result.current.isLoading).toEqual(true)
    })
  })

  describe('useRepoCoverageMock is pending', () => {
    beforeEach(() => {
      setup({
        useRepoOverviewMock: {
          data: {
            coverage: 70.4,
            defaultBranch: 'c3',
            branches: [{ node: { name: 'fcg' } }, { node: { name: 'imogen' } }],
          },
          isLoading: false,
        },
        useRepoCoverageMock: { data: {}, isLoading: true },
      })
    })

    it('isLoading is correct', () => {
      expect(hookData.result.current.isLoading).toEqual(false)
    })
  })

  describe('both services have resolved', () => {
    beforeEach(() => {
      setup({
        useRepoOverviewMock: {
          data: {
            coverage: 70.4,
            defaultBranch: 'c3',
            branches: {
              edges: [{ node: { name: 'fcg' } }, { node: { name: 'imogen' } }],
            },
          },
          isLoading: false,
        },
        useRepoCoverageMock: {
          data: { show: 'Critical Role' },
          isLoading: false,
        },
      })

      return hookData.waitFor(() => !hookData.result.current.isLoading)
    })

    it('isLoading is correct', () => {
      expect(hookData.result.current.isLoading).toEqual(false)
    })

    it('passes down useRepoCoverage', () => {
      expect(hookData.result.current.data).toEqual({ show: 'Critical Role' })
    })

    it('handles the list of branches', () => {
      expect(hookData.result.current.branches).toEqual([
        { name: 'fcg' },
        { name: 'imogen' },
      ])
    })

    it('provides the defaultBranch', () => {
      expect(hookData.result.current.defaultBranch).toEqual('c3')
    })

    it('provides the repo coverage', () => {
      expect(hookData.result.current.coverage).toEqual(70.4)
    })
  })
})
