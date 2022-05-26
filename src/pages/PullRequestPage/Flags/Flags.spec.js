import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { useFlagsForComparePage } from 'services/flags'

import Flags from './Flags'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))
jest.mock('services/flags')

jest.spyOn(window.localStorage.__proto__, 'setItem')
window.localStorage.__proto__.setItem = jest.fn()

const mockFlagsData = {
  data: [
    {
      name: 'secondTest',
      baseReportTotals: {
        files: 1,
        lines: 12,
        hits: 12,
        misses: 0,
        partials: 0,
        coverage: 80,
        branches: 2,
        methods: 4,
        messages: 0,
        sessions: 1,
        complexity: 0,
        complexityTotal: 0,
        complexityRatio: 0,
        diff: 0,
      },
      headReportTotals: {
        files: 1,
        lines: 14,
        hits: 12,
        misses: 1,
        partials: 1,
        coverage: 82.71,
        branches: 3,
        methods: 5,
        messages: 0,
        sessions: 1,
        complexity: 0,
        complexityTotal: 0,
        complexityRatio: 0,
        diff: 0,
      },
      diffTotals: {
        files: 2,
        lines: 0,
        hits: 0,
        misses: 0,
        partials: 0,
        coverage: 59,
        branches: 0,
        methods: 0,
        messages: 0,
        sessions: 0,
        complexity: null,
        complexityTotal: null,
        complexityRatio: 0,
        diff: 0,
      },
    },
  ],
}

const initialEntries = ['/gh/test-org/test-repo/pull/5']

describe('Flags Card', () => {
  function setup(data) {
    useParams.mockReturnValue({
      owner: 'laudna',
      provider: 'gh',
      repo: 'bells-hells',
      pullId: 5,
    })
    useFlagsForComparePage.mockReturnValue(data)

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">
          <Flags />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with populated data', () => {
    beforeEach(() => {
      setup(mockFlagsData)
    })

    it('renders a card for every valid field', () => {
      const flagsCardTitle = screen.getByText('Flags')
      expect(flagsCardTitle).toBeInTheDocument()
      const nameTableField = screen.getByText(`Name`)
      expect(nameTableField).toBeInTheDocument()
      const headTableField = screen.getByText(`HEAD %`)
      expect(headTableField).toBeInTheDocument()
      const patchTableField = screen.getByText(`Patch %`)
      expect(patchTableField).toBeInTheDocument()
      const changeTableField = screen.getByText(`+/-`)
      expect(changeTableField).toBeInTheDocument()

      const flagName = screen.getByText('secondTest')
      expect(flagName).toBeInTheDocument()
      const flagHeadCoverage = screen.getByText('82.71%')
      expect(flagHeadCoverage).toBeInTheDocument()
      const flagPatchCoverage = screen.getByText('59.00%')
      expect(flagPatchCoverage).toBeInTheDocument()
      const flagChangeCoverage = screen.getByText('2.71%')
      expect(flagChangeCoverage).toBeInTheDocument()

      const dismissButton = screen.queryByText('Dismiss')
      expect(dismissButton).not.toBeInTheDocument()
    })
  })

  describe('when rendered without flags but card is not dismissed', () => {
    beforeEach(() => {
      const mockEmptyResponse = { data: [] }
      setup(mockEmptyResponse)
    })

    it('renders a card for every valid field', () => {
      const nameTableField = screen.queryByText(`Name`)
      expect(nameTableField).not.toBeInTheDocument()
      const headTableField = screen.queryByText(`HEAD %`)
      expect(headTableField).not.toBeInTheDocument()
      const patchTableField = screen.queryByText(`Patch %`)
      expect(patchTableField).not.toBeInTheDocument()
      const changeTableField = screen.queryByText(`+/-`)
      expect(changeTableField).not.toBeInTheDocument()

      const flagsCardTitle = screen.getByText('Flags')
      expect(flagsCardTitle).toBeInTheDocument()
      const dismissButton = screen.getByText('Dismiss')
      expect(dismissButton).toBeInTheDocument()
      const flagsDescription = screen.getByText(
        /Flags feature is not yet configured. Learn how flags can/i
      )
      expect(flagsDescription).toBeInTheDocument()
      const flagsAnchor = screen.getByRole('link', /help your team today/i)
      expect(flagsAnchor).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/flags'
      )
      expect(flagsDescription).toBeInTheDocument()
      const flagsMarketingImg = screen.getByRole('img', {
        name: /FlagManagement/,
      })
      expect(flagsMarketingImg).toBeInTheDocument()
      expect(flagsMarketingImg).toHaveAttribute('src', 'flagManagement.svg')
      expect(flagsMarketingImg).toHaveAttribute('alt', 'FlagManagement')
    })

    it('dismisses the card after dismiss button is pressed', () => {
      let flagsCardTitle = screen.getByText('Flags')
      expect(flagsCardTitle).toBeInTheDocument()
      const dismissButton = screen.getByRole('button', { name: /Dismiss/i })
      dismissButton.click()
      expect(localStorage.setItem).toBeCalledWith('gz-dismissFlagsCard', 'true')

      flagsCardTitle = screen.queryByText('Flags')
      expect(flagsCardTitle).not.toBeInTheDocument()
    })
  })

  describe('when card is dismissed', () => {
    beforeEach(() => {
      const mockEmptyResponse = { data: [] }
      setup(mockEmptyResponse)
    })

    it('card wont be rendered whatsoever', () => {
      screen.getByRole('button', { name: /Dismiss/i }).click()
      const nameTableField = screen.queryByText(`Name`)
      expect(nameTableField).not.toBeInTheDocument()
      const headTableField = screen.queryByText(`HEAD %`)
      expect(headTableField).not.toBeInTheDocument()
      const patchTableField = screen.queryByText(`Patch %`)
      expect(patchTableField).not.toBeInTheDocument()
      const changeTableField = screen.queryByText(`+/-`)
      expect(changeTableField).not.toBeInTheDocument()

      const flagsCardTitle = screen.queryByText('Flags')
      expect(flagsCardTitle).not.toBeInTheDocument()
      const dismissButton = screen.queryByText('Dismiss')
      expect(dismissButton).not.toBeInTheDocument()
      const flagsDescription = screen.queryByText(
        /Flags feature is not yet configured. Learn how flags can/i
      )
      expect(flagsDescription).not.toBeInTheDocument()
    })
  })
})
