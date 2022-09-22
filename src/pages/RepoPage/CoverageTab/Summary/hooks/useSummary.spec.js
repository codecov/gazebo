import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoCoverage, useRepoOverview } from 'services/repo'

import { useSummary } from './useSummary'

import { useBranchSelector } from '../../hooks'

jest.mock('services/repo')
jest.mock('../../hooks')

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
    useBranchSelector.mockReturnValue({
      selection: { name: 'my branch', head: { commitid: '1234' } },
      branchSelectorProps: { someProps: 1 },
      newPath: 'test/test/',
      isRedirectionEnabled: true,
    })

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
            defaultBranch: 'c3',
            private: true,
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

    it('passed down branch selector props', () => {
      expect(hookData.result.current.branchSelectorProps).toEqual({
        someProps: 1,
      })
    })

    it('passed down the currentBranchSelected', () => {
      expect(hookData.result.current.currentBranchSelected).toEqual({
        name: 'my branch',
        head: { commitid: '1234' },
      })
    })

    it('passed down the defaultBranch', () => {
      expect(hookData.result.current.defaultBranch).toEqual('c3')
    })

    it('passed down the privateRepo', () => {
      expect(hookData.result.current.privateRepo).toEqual(true)
    })
  })
})
