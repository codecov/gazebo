import { useLocation } from 'react-router-dom'

import { repoPageRender, screen } from 'pages/RepoPage/repo-jest-setup'
// import userEvent from '@testing-library/user-event'

import { useSummary } from './hooks'
import Summary from './Summary'

jest.mock('./hooks')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}))

describe('Summary', () => {
  const mockOnChange = jest.fn()
  function setup({ useSummaryData }) {
    useSummary.mockReturnValue(useSummaryData)
    repoPageRender({
      renderRoot: () => <Summary />,
      initialEntries: ['/gh/criticalrole/mightynein'],
    })
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
          enableRedirection: false,
          currenBranchSelected: selectedBranch,
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
          enableRedirection: false,
          currenBranchSelected: undefined,
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

  xdescribe('handles branch selector redirect', () => {
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
          enableRedirection: false,
          currenBranchSelected: selectedBranch,
          defaultBranch: 'main',
          privateRepo: false,
        },
      })
      // screen.debug()
      // userEvent.click(screen.findByText(/something-else/))
      // userEvent.click(screen.findByText(/critical-role/))
    })

    it('triggered a new location', () => {
      expect(useLocation).toBeCalledWith({})
    })
  })
})
