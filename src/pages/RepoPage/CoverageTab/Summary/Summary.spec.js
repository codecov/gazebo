import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCoverageRedirect, useSummary } from './hooks'
import Summary from './Summary'

jest.mock('./hooks')

describe('Summary', () => {
  const mockOnChange = jest.fn()
  const mockSetNewPath = jest.fn()
  const mockUseCoverageRedirectData = {
    redirectState: {
      isRedirectionEnabled: false,
      newPath: undefined,
    },
    setNewPath: mockSetNewPath,
  }
  function setup({ useSummaryData, useCoverageRedirectData }) {
    useSummary.mockReturnValue(useSummaryData)
    useCoverageRedirect.mockReturnValue(useCoverageRedirectData)

    render(
      <MemoryRouter initialEntries={['/gh/test/critical-role']}>
        <Route path="/:provider/:owner/:repo">
          <Summary />
        </Route>
        {/* 
          Route to render the current location to reduce complexity to track
          the current location
        */}
        <Route
          path="*"
          render={({ location }) => {
            return location.pathname
          }}
        />
      </MemoryRouter>
    )
  }

  describe('with populated data', () => {
    beforeEach(() => {
      const selectedBranch = {
        name: 'something-else',
        head: {
          commitid: 'abs890dasf809',
        },
      }

      setup({
        useCoverageRedirectData: mockUseCoverageRedirectData,
        useSummaryData: {
          isLoading: false,
          data: {},
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
          currentBranchSelected: selectedBranch,
          defaultBranch: 'main',
          privateRepo: false,
        },
      })
    })

    it('renders the branch selector', () => {
      expect(screen.getByText(/Branch Context/)).toBeInTheDocument()
    })

    it('renders the source commit short sha', () => {
      expect(screen.getByText(/abs890d/)).toBeInTheDocument()
    })
  })

  describe('before data has resolved', () => {
    beforeEach(() => {
      setup({
        useCoverageRedirectData: mockUseCoverageRedirectData,
        useSummaryData: {
          isLoading: false,
          data: {},
          branchSelectorProps: {
            items: [{}],
            onChange: mockOnChange,
            value: {},
          },
          currentBranchSelected: undefined,
          defaultBranch: 'main',
          privateRepo: false,
        },
      })
    })

    it('renders the branch selector', () => {
      expect(screen.getByText(/Branch Context/)).toBeInTheDocument()
    })

    it('if no branch selected do not render the sha', () => {
      expect(screen.queryByText(/abs890d/)).not.toBeInTheDocument()
    })
  })

  describe('branch coverage', () => {
    beforeEach(() => {
      const selectedBranch = {
        name: 'something-else',
        head: {
          commitid: 'abs890dasf809',
        },
      }

      setup({
        useCoverageRedirectData: mockUseCoverageRedirectData,
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
          currentBranchSelected: selectedBranch,
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
  /*
    I don't love this test but I couldn't think of a good way to test
    the select user interaction and the location change correctly.
  */
  describe('uses a conditional Redirect', () => {
    beforeEach(() => {
      const selectedBranch = {
        name: 'something-else',
        head: {
          commitid: 'abs890dasf809',
        },
      }

      setup({
        useCoverageRedirectData: {
          redirectState: {
            newPath: '/some/new/location',
            isRedirectionEnabled: true,
          },
          setNewPath: mockSetNewPath,
        },
        useSummaryData: {
          isLoading: false,
          data: {},
          branchSelectorProps: {
            items: [selectedBranch],
            onChange: mockOnChange,
            value: selectedBranch,
          },
          currentBranchSelected: selectedBranch,
          defaultBranch: 'main',
          privateRepo: false,
        },
      })
    })

    it('updates the location', () => {
      expect(screen.getByText(/some\/new\/location/)).toBeInTheDocument()
    })
  })

  describe('fires the setNewPath on branch selection', () => {
    beforeEach(() => {
      const selectedBranch = {
        name: 'something-else',
        head: {
          commitid: 'abs890dasf809',
        },
      }

      setup({
        useCoverageRedirectData: {
          redirectState: {
            newPath: '/some/new/location',
            isRedirectionEnabled: true,
          },
          setNewPath: mockSetNewPath,
        },
        useSummaryData: {
          isLoading: false,
          data: {},
          branchSelectorProps: {
            items: [
              { name: 'foo', head: { commitid: '1234' } },
              selectedBranch,
            ],
            onChange: mockOnChange,
            value: selectedBranch,
          },
          currentBranchSelected: selectedBranch,
          defaultBranch: 'main',
          privateRepo: false,
        },
      })
    })
    beforeEach(() => {
      // open select
      userEvent.click(screen.getByRole('button', { name: /something-else/i }))
      // pick foo branch
      userEvent.click(screen.getByRole('option', { name: /foo/ }))
    })

    it('updates the location', () => {
      expect(mockSetNewPath).toHaveBeenCalled()
    })
  })
})
