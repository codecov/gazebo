import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import CompareSummary from './CompareSummary'
import { usePullForCompareSummary } from './usePullForCompareSummary'

jest.mock('./usePullForCompareSummary')

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
      coverage: 92.12,
    },
    changeWithParent: 38.94,
  },
}

const pullData = {
  headCoverage: 78.33,
  patchCoverage: 92.12,
  changeCoverage: 38.94,
  head: {
    commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
    totals: {
      coverage: 78.33,
    },
    uploads: {
      totalCount: 4,
    },
  },
  base: {
    commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
    uploads: {
      totalCount: 1,
    },
  },
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

  describe('When there isnt a head and base commit', () => {
    beforeEach(() => {
      setup({
        pullData: {
          head: undefined,
          base: undefined,
          headCoverage: undefined,
          patchCoverage: undefined,
          changeCoverage: undefined,
        },
      })
    })

    it('renders a coverage unknown card', () => {
      const card = screen.getByText('Coverage data is unknown')
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
        screen.getAllByText(pull.head.commitid.slice(0, 7))[1]
      ).toBeInTheDocument()
      expect(
        screen.getByText(pull.comparedTo.commitid.slice(0, 7))
      ).toBeInTheDocument()
    })
  })

  describe('When base and head have different number of reports', () => {
    beforeEach(() => {
      setup({
        pullData: {
          ...pullData,
          hasDifferentNumberOfHeadAndBaseReports: true,
          commits: {
            edges: [{ node: { state: 'complete', commitid: 'abc' } }],
          },
        },
      })
    })

    it('renders a card for every valid field', () => {
      const sourceCardTitle = screen.getByText('Source')
      expect(sourceCardTitle).toBeInTheDocument()
      expect(
        screen.getByText(
          /Commits have different number of coverage report uploads/i
        )
      ).toBeInTheDocument()
      const learnMore = screen.getByRole('link', {
        name: /learn more/i,
      })
      expect(learnMore).toBeInTheDocument()
      expect(learnMore).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/unexpected-coverage-changes#mismatching-base-and-head-commit-upload-counts'
      )
      expect(screen.getByText(/(4 uploads)/i)).toBeInTheDocument()
      expect(screen.getByText(/(1 uploads)/i)).toBeInTheDocument()
    })
  })
})
