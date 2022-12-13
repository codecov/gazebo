import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useImpactedFilesTable } from './useImpactedFilesTable'

const mockImpactedFiles = [
  {
    isCriticalFile: true,
    fileName: 'mafs.js',
    headName: 'flag1/mafs.js',
    baseCoverage: {
      percentCovered: 45.38,
    },
    headCoverage: {
      percentCovered: 90.23,
    },
    patchCoverage: {
      percentCovered: 27.43,
      missesCount: 3,
    },
  },
  {
    isCriticalFile: true,
    fileName: 'quarg.js',
    headName: 'flag2/quarg.js',
    baseCoverage: {
      percentCovered: 39,
    },
    headCoverage: {
      percentCovered: 80,
    },
    patchCoverage: {
      percentCovered: 48.23,
      missesCount: 7,
    },
  },
]

let mockPull = {
  owner: {
    repository: {
      pull: {
        pullId: 14,
        head: {
          state: 'PROCESSED',
        },
        compareWithBase: {
          patchTotals: {
            percentCovered: 92.12,
          },
          headTotals: {
            percentCovered: 74.2,
          },
          baseTotals: {
            percentCovered: 27.35,
          },
          changeWithParent: 38.94,
          impactedFiles: mockImpactedFiles,
        },
      },
    },
  },
}

const queryClient = new QueryClient({
  logger: {
    error: () => {},
  },
  defaultOptions: {
    retry: false,
  },
})

const server = setupServer()
beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/frumpkin/another-test/pull/14']}>
    <Route path="/:provider/:owner/:repo/pull/:pullid">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useRepoContentsTable', () => {
  let hookData
  function setup(dataReturned = mockPull) {
    server.use(
      graphql.query('Pull', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )

    hookData = renderHook(() => useImpactedFilesTable(), { wrapper })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => !hookData.result.current.isLoading)
      })

      it('returns data', async () => {
        expect(hookData.result.current.data).toEqual({
          headState: 'PROCESSED',
          impactedFiles: [
            {
              changeCoverage: 44.85,
              fileName: 'mafs.js',
              hasHeadOrPatchCoverage: true,
              headCoverage: 90.23,
              headName: 'flag1/mafs.js',
              isCriticalFile: true,
              patchCoverage: 27.43,
              patchMisses: 3,
            },
            {
              changeCoverage: 41,
              fileName: 'quarg.js',
              hasHeadOrPatchCoverage: true,
              headCoverage: 80,
              headName: 'flag2/quarg.js',
              isCriticalFile: true,
              patchCoverage: 48.23,
              patchMisses: 7,
            },
          ],
          pullBaseCoverage: 27.35,
          pullHeadCoverage: 74.2,
          pullPatchCoverage: 92.12,
        })
      })
    })
  })

  describe('when when called with no head or base coverage on the impacted files', () => {
    beforeEach(() => {
      const mockImpactedFilesWithoutCoverage = [
        {
          isCriticalFile: true,
          fileName: 'mafs.js',
          headName: 'flag1/mafs.js',
          baseCoverage: {
            percentCovered: undefined,
          },
          headCoverage: {
            percentCovered: undefined,
          },
          patchCoverage: {
            percentCovered: 27.43,
          },
        },
      ]
      mockPull.owner.repository.pull.compareWithBase.impactedFiles =
        mockImpactedFilesWithoutCoverage
      setup(mockPull)
      return hookData.waitFor(() => !hookData.result.current.isLoading)
    })

    it('returns data', async () => {
      expect(hookData.result.current.data).toEqual({
        headState: 'PROCESSED',
        impactedFiles: [
          {
            changeCoverage: NaN,
            fileName: 'mafs.js',
            hasHeadOrPatchCoverage: true,
            headCoverage: undefined,
            headName: 'flag1/mafs.js',
            isCriticalFile: true,
            patchCoverage: 27.43,
            patchMisses: 0,
          },
        ],
        pullBaseCoverage: 27.35,
        pullHeadCoverage: 74.2,
        pullPatchCoverage: 92.12,
      })
    })
  })
})
