import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import CompareSummary from './CompareSummary'
import { usePullForCompareSummary } from './hooks'

jest.mock('./hooks')

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
      coverage: 78.33,
    },
  },
  comparedTo: {
    commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
  },
  compareWithBase: {
    patchTotals: {
      coverage: 92.12,
    },
    changeWithParent: 38.94,
  },
}

const pullData = {
  headCoverage: 78.33,
  patchCoverage: 92.12,
  changeCoverage: 38.94,
  headCommit: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
  baseCommit: '2d6c42fe217c61b007b2c17544a9d85840381857',
}

describe('CompareSummary', () => {
  function setup({
    initialEntries = ['/gh/test-org/test-repo/pull/5'],
    pullData,
  }) {
    usePullForCompareSummary.mockReturnValue(pullData)

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">
          <CompareSummary />
        </Route>
      </MemoryRouter>
    )
  }

  describe('Pending or no commits', () => {
    beforeEach(() => {
      setup({
        pullData: {
          ...pullData,
          headCoverage: undefined,
          patchCoverage: undefined,
          changeCoverage: undefined,
        },
      })
    })

    it('renders a pending card', () => {
      const card = screen.getByText('Why is there no coverage data?')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Error render', () => {
    beforeEach(() => {
      setup({
        pullData: {
          ...pullData,
          recentCommit: {
            state: 'error',
            commitid: 'abcdefghijklmnop',
          },
        },
      })
    })

    it('renders a error card', () => {
      const card = screen.getByText(
        /There is an error processing the coverage reports with/i
      )
      expect(card).toBeInTheDocument()
    })
  })

  describe('Successful render', () => {
    beforeEach(() => {
      setup({
        pullData: {
          ...pullData,
          commits: {
            edges: [{ node: { state: 'complete', commitid: 'abc' } }],
          },
        },
      })
    })

    it('renders a card for every valid field', () => {
      const headCardTitle = screen.getByText('HEAD')
      expect(headCardTitle).toBeInTheDocument()
      const headCardValue = screen.getByText(`${pull.head.totals.coverage}%`)
      expect(headCardValue).toBeInTheDocument()

      const patchCardTitle = screen.getByText('Patch')
      expect(patchCardTitle).toBeInTheDocument()
      const patchCardValue = screen.getByText(
        `${pull.compareWithBase.patchTotals.coverage}%`
      )
      expect(patchCardValue).toBeInTheDocument()

      const changeCardTitle = screen.getByText('Change')
      expect(changeCardTitle).toBeInTheDocument()
      const changeCardValue = screen.getByText(
        `${pull.compareWithBase.changeWithParent}%`
      )
      expect(changeCardValue).toBeInTheDocument()
      expect(changeCardValue).toHaveClass("before:content-['+']")

      const sourceCardTitle = screen.getByText('Source')
      expect(sourceCardTitle).toBeInTheDocument()
      expect(screen.getByText(/Coverage data based on/i)).toBeInTheDocument()
      expect(
        screen.getAllByText(pull.head.commitid.substr(0, 7))[1]
      ).toBeInTheDocument()
      expect(
        screen.getByText(pull.comparedTo.commitid.substr(0, 7))
      ).toBeInTheDocument()
    })
  })
})
