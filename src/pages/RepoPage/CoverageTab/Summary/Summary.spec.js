import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useSummary } from './hooks'
import Summary from './Summary'

jest.mock('./hooks')

describe('Summary', () => {
  const mockOnChange = jest.fn()
  function setup({ useSummaryData }) {
    useSummary.mockReturnValue(useSummaryData)

    render(
      <MemoryRouter initialEntries={['/gh/test/critical-role']}>
        <Route path="/:provider/:owner/:repo">
          <Summary />
        </Route>
      </MemoryRouter>
    )
  }

  describe('branch coverage', () => {
    beforeEach(() => {
      const selectedBranch = {
        name: 'something-else',
        head: {
          commitid: 'abs890dasf809',
        },
      }

      setup({
        useSummaryData: {
          isLoading: false,
          data: {
            head: {
              totals: { percentCovered: 60.4, hitsCount: 54, lineCount: 753 },
            },
          },
          branchSelectorProps: {
            items: [{ name: 'critical-role' }, selectedBranch],
            onChange: mockOnChange,
            value: {
              name: 'something-else',
              head: {
                commitid: 'abs890dasf809',
              },
            },
          },
          newPath: undefined,
          enableRedirection: false,
          currenBranchSelected: selectedBranch,
          defaultBranch: 'main',
          privateRepo: false,
        },
      })
    })

    it('renders the branch coverage', () => {
      expect(screen.getByText('60.40%')).toBeInTheDocument()
    })
    it('renders the lines covered', () => {
      expect(screen.getByText('54 of 753 lines covered')).toBeInTheDocument()
    })
  })
})
