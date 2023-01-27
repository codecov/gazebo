import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import isNumber from 'lodash/isNumber'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import {
  getCommitDataForSummary,
  useCommitForSummary,
} from './useCommitForSummary'

const data = {
  commit: {
    totals: { coverage: 90.91 },
    state: 'complete',
    commitid: 'ca3fe8ad0632288b67909ba9793b00e5d109547b',
    pullId: null,
    branchName: 'main',
    createdAt: '2022-03-10T19:14:13',
    author: { username: 'Rabee-AbuBaker' },
    uploads: [
      {
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
        errors: [],
      },
      {
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
        errors: [],
      },
      {
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
        errors: [],
      },
    ],
    message: 'Test commit',
    ciPassed: true,
    parent: {
      commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
      totals: { coverage: 100 },
    },
    compareWithParent: {
      state: 'processed',
      patchTotals: { coverage: 75 },
      impactedFiles: [
        {
          patchCoverage: { coverage: 75 },
          headName: 'flag1/mafs.js',
          baseCoverage: { coverage: 100 },
          headCoverage: { coverage: 90.9090909090909 },
        },
      ],
    },
  },
}

const commit = data?.commit
const rawPatch = commit?.compareWithParent?.patchTotals?.coverage
const parentCoverage = commit?.parent?.totals?.coverage
const headCoverage = commit?.totals?.coverage

const successfulExpectedData = {
  headCoverage: commit?.totals?.coverage,
  patchCoverage: isNumber(rawPatch) ? rawPatch : Number.NaN,
  changeCoverage: headCoverage - parentCoverage,
  headCommitId: commit?.commitid,
  parentCommitId: commit?.parent?.commitid,
  state: commit?.state,
}

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('usePullForCompareSummary', () => {
  function setup() {
    server.use(
      graphql.query('Commit', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: { repository: data } }))
      )
    )
  }

  beforeEach(() => setup())

  it('returns data accordingly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useCommitForSummary({
          provider: 'gh',
          owner: 'codecov',
          repo: 'cool-repo',
          commit: 'sha256',
        }),
      {
        wrapper,
      }
    )

    await waitFor(() => expect(result.current).toEqual(successfulExpectedData))
  })
})

describe('getPullDataForCompareSummary', () => {
  it('returns all values accordingly', () => {
    const { compareWithParent, totals, parent, state, commitid } = data?.commit

    const returnedData = getCommitDataForSummary({
      compareWithParent,
      totals,
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
