import { renderHook } from '@testing-library/react-hooks'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'

import { getPullDataForCompareSummary, usePullForCompareSummary } from './hooks'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))
jest.mock('services/pull/hooks')

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
  },
  comparedTo: {
    commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
  },
  compareWithBase: {
    patchTotals: {
      percentCovered: 0.9212,
    },
    changeWithParent: 38.94,
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
const commits = pull?.commits?.edges

const succesfulExpectedData = {
  headCoverage: head?.totals?.percentCovered,
  patchCoverage: compareWithBase?.patchTotals?.percentCovered * 100,
  changeCoverage: compareWithBase?.changeWithParent,
  headCommit: head?.commitid,
  baseCommit: base?.commitid,
  recentCommit: { state: 'error', commitid: 'abc' },
}

describe('usePullForCompareSummary', () => {
  let hookData

  function setup() {
    useParams.mockReturnValue({
      owner: 'caleb',
      provider: 'gh',
      repo: 'mighty-nein',
      pullId: '9',
    })
    usePull.mockReturnValue({ data: pull })
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
      // TODO: Change this back to undefined; since we're multiplying by 100, this returns NaN type
      patchCoverage: NaN,
      changeCoverage: undefined,
      headCommit: undefined,
      baseCommit: undefined,
    }

    const data = getPullDataForCompareSummary({
      head: null,
      base: null,
      compareWithBase: null,
    })
    expect(data).toEqual(undefinedExpectedData)
  })
})
