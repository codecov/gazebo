import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useComparisonForCommitAndParent } from './useComparisonForCommitAndParent'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'
const commitid = 'sha123'

const mockImpactedFile = {
  isCriticalFile: false,
  headName: 'flag1/file.js',
  hashedPath: 'hashedFilePath',
  segments: [
    {
      header: '-0,0 +1,45',
      hasUnintendedChanges: false,
      lines: [
        {
          baseNumber: null,
          headNumber: '1',
          baseCoverage: null,
          headCoverage: 'H',
          content: '+export default class Calculator {',
          coverageInfo: {
            hitCount: null,
            hitUploadIds: null,
          },
        },
        {
          baseNumber: null,
          headNumber: '2',
          baseCoverage: null,
          headCoverage: 'H',
          content: '+  private value = 0;',
          coverageInfo: {
            hitCount: 1,
            hitUploadIds: [1],
          },
        },
        {
          baseNumber: null,
          headNumber: '3',
          baseCoverage: null,
          headCoverage: 'H',
          content: '+  private calcMode = ""',
          coverageInfo: {
            hitCount: null,
            hitUploadIds: null,
          },
        },
      ],
    },
  ],
}

const baseMock = {
  owner: {
    repository: {
      commit: {
        compareWithParent: {
          impactedFile: {
            ...mockImpactedFile,
          },
        },
      },
    },
  },
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useComparisonForCommitAndParent', () => {
  function setup() {
    server.use(
      graphql.query('ImpactedFileComparedWithParent', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(baseMock))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns the data', async () => {
      const { result, waitFor } = renderHook(
        () =>
          useComparisonForCommitAndParent({
            provider,
            owner,
            repo,
            commitid,
            path: 'someFile.js',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => expect(result.current.data.data).toEqual(baseMock))
    })
  })
})
