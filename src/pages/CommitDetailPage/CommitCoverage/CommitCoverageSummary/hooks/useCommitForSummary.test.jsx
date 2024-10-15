import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import isNumber from 'lodash/isNumber'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import {
  getCommitDataForSummary,
  useCommitForSummary,
} from './useCommitForSummary'

const data = {
  commit: {
    coverageAnalytics: {
      totals: { coverage: 90.91 },
    },
    state: 'complete',
    commitid: 'ca3fe8ad0632288b67909ba9793b00e5d109547b',
    pullId: 123,
    branchName: 'main',
    createdAt: '2022-03-10T19:14:13',
    author: { username: 'Rabee-AbuBaker' },
    uploads: {
      edges: [
        {
          node: {
            id: null,
            name: null,
            state: 'PROCESSED',
            provider: null,
            createdAt: '2022-03-10T19:14:33.148945+00:00',
            updatedAt: '2022-03-10T19:14:33.347403+00:00',
            flags: [],
            jobCode: null,
            downloadUrl:
              '/upload/gh/Rabee-AbuBaker/another-test/download?path=v4/raw/2022-03-10/8D515A8AC57CA50377BBB7743D7BDB0B/ca3fe8ad0632288b67909ba9793b00e5d109547b/71a6b706-7135-43e3-9098-34bba60312c2.txt',
            ciUrl: null,
            uploadType: 'UPLOADED',
            buildCode: null,
            errors: null,
          },
        },
        {
          node: {
            id: null,
            name: null,
            state: 'PROCESSED',
            provider: null,
            createdAt: '2022-03-14T12:49:29.568415+00:00',
            updatedAt: '2022-03-14T12:49:30.157909+00:00',
            flags: [],
            jobCode: null,
            downloadUrl:
              '/upload/gh/Rabee-AbuBaker/another-test/download?path=v4/raw/2022-03-14/8D515A8AC57CA50377BBB7743D7BDB0B/ca3fe8ad0632288b67909ba9793b00e5d109547b/e83fec55-633d-4621-b509-35678628ffd0.txt',
            ciUrl: null,
            uploadType: 'UPLOADED',
            buildCode: null,
            errors: null,
          },
        },
        {
          node: {
            id: null,
            name: null,
            state: 'COMPLETE',
            provider: null,
            createdAt: '2022-03-14T12:49:29.568415+00:00',
            updatedAt: '2022-03-14T12:49:30.157909+00:00',
            flags: [],
            jobCode: null,
            downloadUrl:
              '/upload/gh/Rabee-AbuBaker/another-test/download?path=v4/raw/2022-03-14/8D515A8AC57CA50377BBB7743D7BDB0B/ca3fe8ad0632288b67909ba9793b00e5d109547b/e83fec55-633d-4621-b509-35678628ffd0.txt',
            ciUrl: null,
            uploadType: 'CARRIEDFORWARD',
            buildCode: null,
            errors: null,
          },
        },
      ],
    },

    message: 'Test commit',
    ciPassed: true,
    parent: {
      commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
      coverageAnalytics: {
        totals: { coverage: 100 },
      },
    },
    compareWithParent: {
      __typename: 'Comparison',
      state: 'processed',
      patchTotals: { coverage: 75 },
      indirectChangedFilesCount: 1,
      directChangedFilesCount: 1,
      impactedFiles: {
        __typename: 'ImpactedFiles',
        results: [
          {
            headName: 'flag1/mafs.js',
            isCriticalFile: false,
            patchCoverage: { coverage: 75 },
            baseCoverage: { coverage: 100 },
            headCoverage: { coverage: 90.9090909090909 },
          },
        ],
      },
    },
  },
}

const commit = data?.commit
const rawPatch = commit?.compareWithParent?.patchTotals?.coverage
const parentCoverage = commit?.parent?.coverageAnalytics?.totals?.coverage
const headCoverage = commit?.coverageAnalytics?.totals?.coverage

const successfulExpectedData = {
  headCoverage: commit?.coverageAnalytics?.totals?.coverage,
  patchCoverage: isNumber(rawPatch) ? rawPatch : Number.NaN,
  changeCoverage: headCoverage - parentCoverage,
  headCommitId: commit?.commitid,
  parentCommitId: commit?.parent?.commitid,
  state: commit?.state,
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/commit/sha256']}>
      <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

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

describe('usePullForCompareSummary', () => {
  function setup() {
    server.use(
      graphql.query('Commit', (info) => {
        return HttpResponse.json({
          data: {
            owner: { repository: { __typename: 'Repository', ...data } },
          },
        })
      })
    )
  }

  it('returns data accordingly', async () => {
    setup()
    const { result } = renderHook(
      () =>
        useCommitForSummary({
          provider: 'gh',
          owner: 'codecov',
          repo: 'cool-repo',
          commit: 'sha256',
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current).toEqual(successfulExpectedData))
  })
})

describe('getPullDataForCompareSummary', () => {
  it('returns all values accordingly', () => {
    const { compareWithParent, coverageAnalytics, parent, state, commitid } =
      data?.commit

    const returnedData = getCommitDataForSummary({
      compareWithParent,
      totals: coverageAnalytics?.totals,
      parent,
      state,
      commitid,
    })
    expect(returnedData).toEqual(successfulExpectedData)
  })

  it('returns invalid values for undefined parameters', () => {
    const undefinedExpectedData = {
      headCoverage: undefined,
      patchCoverage: NaN,
      changeCoverage: NaN,
      headCommitId: undefined,
      parentCommitId: undefined,
      state: undefined,
    }

    const returnedData = getCommitDataForSummary({})
    expect(returnedData).toEqual(undefinedExpectedData)
  })
})
