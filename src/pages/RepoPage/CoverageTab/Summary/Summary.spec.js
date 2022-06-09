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
        {/* 
          Route to render the current location to reduce complextity to track
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
          newPath: undefined,
          isRedirectionEnabled: false,
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
        useSummaryData: {
          isLoading: false,
          data: {},
          branchSelectorProps: {
            items: [],
            onChange: mockOnChange,
            value: {},
          },
          newPath: undefined,
          isRedirectionEnabled: false,
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
          isRedirectionEnabled: false,
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
    I don't love this test but I coundn't think of a good way to test
    the select user interaction and the location change correctly.
  */
  describe('uses a contidtional Redriect', () => {
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
          data: {},
          branchSelectorProps: {
            items: [selectedBranch],
            onChange: mockOnChange,
            value: selectedBranch,
          },
          newPath: '/some/new/location',
          isRedirectionEnabled: true,
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
})
