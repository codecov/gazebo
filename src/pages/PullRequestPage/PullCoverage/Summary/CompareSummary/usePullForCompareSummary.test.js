import { renderHook } from '@testing-library/react'

import {
  getPullDataForCompareSummary,
  usePullForCompareSummary,
} from './usePullForCompareSummary'

const mocks = vi.hoisted(() => ({
  usePull: vi.fn(),
  useParams: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: mocks.useParams,
  }
})
vi.mock('services/pull', async () => {
  const actual = await vi.importActual('services/pull')
  return {
    ...actual,
    usePull: mocks.usePull,
  }
})

const pull = {
  pullId: 5,
  title: 'fix stuff',
  state: 'OPEN',
  updatestamp: '2021-03-03T17:54:07.727453',
  author: {
    username: 'landonorris',
  },
  head: {
    commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
    totals: {
      percentCovered: 78.33,
    },
    uploads: {
      totalCount: 4,
    },
  },
  comparedTo: {
    commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
    uploads: {
      totalCount: 1,
    },
  },
  compareWithBase: {
    patchTotals: {
      percentCovered: 92.12,
    },
    changeCoverage: 38.94,
    hasDifferentNumberOfHeadAndBaseReports: true,
  },
  commits: {
    edges: [
      { node: { state: 'error', commitid: 'abc' } },
      { node: { state: 'processed', commitid: 'abc' } },
      { node: { state: 'complete', commitid: 'abc' } },
    ],
  },
}

const head = pull?.head
const base = pull?.comparedTo
const compareWithBase = pull?.compareWithBase
const commits = [
  { state: 'error', commitid: 'abc' },
  { state: 'processed', commitid: 'abc' },
  { state: 'complete', commitid: 'abc' },
]

const succesfulExpectedData = {
  headCoverage: head?.totals?.percentCovered,
  patchCoverage: compareWithBase?.patchTotals?.percentCovered,
  changeCoverage: compareWithBase?.changeCoverage,
  head: {
    totals: head?.totals,
    commitid: head?.commitid,
    uploads: {
      totalCount: head?.uploads?.totalCount,
    },
  },
  base: {
    commitid: base?.commitid,
    uploads: {
      totalCount: base?.uploads?.totalCount,
    },
  },
  recentCommit: { state: 'error', commitid: 'abc' },
  hasDifferentNumberOfHeadAndBaseReports:
    compareWithBase?.hasDifferentNumberOfHeadAndBaseReports,
}

describe('usePullForCompareSummary', () => {
  let hookData

  function setup() {
    mocks.useParams.mockReturnValue({
      owner: 'caleb',
      provider: 'gh',
      repo: 'mighty-nein',
      pullId: '9',
    })
    mocks.usePull.mockReturnValue({ data: { pull } })
    hookData = renderHook(() => usePullForCompareSummary())
  }

  it('returns data accordingly', () => {
    setup()
    expect(hookData.result.current).toEqual(succesfulExpectedData)
  })
})

describe('getPullDataForCompareSummary', () => {
  it('returns all values accordingly', () => {
    const data = getPullDataForCompareSummary({
      head,
      base,
      compareWithBase,
      commits,
    })
    expect(data).toEqual(succesfulExpectedData)
  })

  it('returns undefined for undefined parameters', () => {
    const undefinedExpectedData = {
      headCoverage: undefined,
      patchCoverage: NaN,
      changeCoverage: undefined,
      hasDifferentNumberOfHeadAndBaseReports: undefined,
      head: null,
      base: null,
    }

    const data = getPullDataForCompareSummary({
      head: null,
      base: null,
      compareWithBase: null,
    })
    expect(data).toEqual(undefinedExpectedData)
  })
})
