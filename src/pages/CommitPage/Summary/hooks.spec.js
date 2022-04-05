import { renderHook } from '@testing-library/react-hooks'
import isNumber from 'lodash/isNumber'
import { useParams } from 'react-router-dom'

import { useCommit } from 'services/commit'

import { getCommitDataForSummary, useCommitForSummary } from './hooks'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))
jest.mock('services/commit/hooks')

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
    ],
    message: 'Test commit',
    ciPassed: true,
    parent: {
      commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
      totals: { coverage: 100 },
    },
    compareWithParent: {
      state: 'processed',
      patchTotals: { coverage: 0.75 },
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
  patchCoverage: isNumber(rawPatch) ? rawPatch * 100 : Number.NaN,
  changeCoverage: headCoverage - parentCoverage,
  headCommitId: commit?.commitid,
  parentCommitId: commit?.parent?.commitid,
  state: commit?.state,
}

describe('usePullForCompareSummary', () => {
  let hookData

  function setup() {
    useParams.mockReturnValue({
      owner: 'Rabee-AbuBaker',
      provider: 'gh',
      repo: 'another-test',
      commit: 'ca3fe8ad0632288b67909ba9793b00e5d109547b',
    })
    useCommit.mockReturnValue({ data })
    hookData = renderHook(() => useCommitForSummary())
  }

  it('returns data accordingly', () => {
    setup()
    expect(hookData.result.current).toEqual(successfulExpectedData)
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
