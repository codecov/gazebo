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
        <Route path="/:provider/:owner/:repo/pull/:pullid">
          <CompareSummary />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with valid fields', () => {
    beforeEach(() => {
      setup({ pullData })
    })

    it('renders a card for every valid field', () => {
      const headCardTitle = screen.getByText('HEAD')
      expect(headCardTitle).toBeInTheDocument()
      const headCardValue = screen.getByText(`${pull.head.totals.coverage} %`)
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
        `+${pull.compareWithBase.changeWithParent}%`
      )
      expect(changeCardValue).toBeInTheDocument()

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
