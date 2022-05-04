import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { usePull } from 'services/pull'

import Root from './Root'

jest.mock('services/pull')

// Not final data.
const mockPullData = {
  isLoading: false,
  data: {
    title: 'pull1',
    pullComparison: {
      baseTotals: {
        coverage: 75,
        fileCount: 1,
        lineCount: 4,
        hitsCount: 3,
        missesCount: 1,
        partialsCount: 0,
      },
      headTotals: {
        coverage: 75,
        fileCount: 1,
        lineCount: 4,
        hitsCount: 3,
        missesCount: 1,
        partialsCount: 0,
      },
      files: [
        {
          baseName: 'main/__init__.py',
          headName: 'main/__init__.py',
          baseTotals: {
            coverage: 75,
            lineCount: 4,
            hitsCount: 3,
            missesCount: 1,
            partialsCount: 0,
          },
          headTotals: {
            coverage: 100,
            lineCount: 6,
            hitsCount: 6,
            missesCount: 0,
            partialsCount: 0,
          },
          hasDiff: true,
          lines: [
            {
              baseNumber: '3',
              headNumber: '3',
              baseCoverage: null,
              headCoverage: null,
              content: ' ',
            },
            {
              baseNumber: '4',
              headNumber: '4',
              baseCoverage: 'H',
              headCoverage: 'H',
              content: ' def sub(x, y):',
            },
            {
              baseNumber: '5',
              headNumber: '5',
              baseCoverage: 'M',
              headCoverage: 'H',
              content: '     return x - y',
            },
            {
              baseNumber: null,
              headNumber: '6',
              baseCoverage: null,
              headCoverage: null,
              content: '+',
            },
            {
              baseNumber: null,
              headNumber: '7',
              baseCoverage: null,
              headCoverage: 'H',
              content: '+def mul(x, y):',
            },
            {
              baseNumber: null,
              headNumber: '8',
              baseCoverage: null,
              headCoverage: 'H',
              content: '+    return x * y',
            },
          ],
        },
      ],
    },
  },
}

describe('Root', () => {
  function setup({ initialEntries = ['/gh/test-org/test-repo/pull/12'] }) {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">
          <Root />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      usePull.mockReturnValue(mockPullData)

      setup({})
    })
    it('renders the name of a impacted file', () => {
      expect(screen.getByText(/main\/__init__.py/i)).toBeInTheDocument()
    })
  })
})
