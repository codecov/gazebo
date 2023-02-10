import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { CommitStateEnum } from 'shared/utils/commit'

import Root from './Root'

jest.mock('./FilesChanged/FilesChanged', () => () => 'Files Changed Component')

const mockImpactedFiles = [
  {
    isCriticalFile: true,
    fileName: 'mafs.js',
    headName: 'flag1/mafs.js',
    baseCoverage: {
      percentCovered: 45.38,
    },
    headCoverage: {
      percentCovered: 90.23,
      missesCount: 3,
    },
    patchCoverage: {
      percentCovered: 27.43,
    },
    missesInComparison: 3,
  },
  {
    isCriticalFile: true,
    fileName: 'quarg.js',
    headName: 'flag2/quarg.js',
    baseCoverage: {
      percentCovered: 39,
    },
    headCoverage: {
      percentCovered: 80,
      missesCount: 7,
    },
    patchCoverage: {
      percentCovered: 48.23,
    },
    missesInComparison: 7,
  },
]

const mockPull = {
  owner: {
    repository: {
      pull: {
        pullId: 14,
        head: {
          state: 'COMPLETE',
        },
        compareWithBase: {
          patchTotals: {
            percentCovered: 92.12,
          },
          headTotals: {
            percentCovered: 74.2,
          },
          baseTotals: {
            percentCovered: 27.35,
          },
          changeWithParent: 38.94,
          impactedFiles: mockImpactedFiles,
        },
      },
    },
  },
}

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/12']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('Root', () => {
  function setup({ overrideData } = {}) {
    server.use(
      graphql.query('Pull', (_, res, ctx) => {
        if (overrideData) {
          return res(ctx.status(200), ctx.data(overrideData))
        }

        return res(ctx.status(200), ctx.data(mockPull))
      })
    )
  }

  describe('when rendered with changed files', () => {
    beforeEach(() => {
      setup()
    })

    it('renders changed files component', async () => {
      render(<Root />, { wrapper })

      const filesChangedComponent = await screen.findByText(
        /Files Changed Component/
      )
      expect(filesChangedComponent).toBeInTheDocument()
    })
  })

  describe('when rendered without changes', () => {
    beforeEach(() => {
      const overrideData = {
        owner: {
          repository: {
            pull: {
              pullId: 14,
              head: {
                state: 'COMPLETE',
              },
              compareWithBase: {
                patchTotals: {
                  percentCovered: 92.12,
                },
                headTotals: {
                  percentCovered: 74.2,
                },
                baseTotals: {
                  percentCovered: 27.35,
                },
                changeWithParent: 38.94,
                impactedFiles: [],
              },
            },
          },
        },
      }
      setup({ overrideData })
    })
    it('renders no change text', async () => {
      render(<Root />, { wrapper })

      const noChangesText = await screen.findByText(
        'Everything is accounted for! No changes detected that need to be reviewed.'
      )
      expect(noChangesText).toBeInTheDocument()

      const body = await screen.findByText(
        'Lines, not adjusted in diff, that have changed coverage data.'
      )
      expect(body).toBeInTheDocument()

      expect(
        screen.queryByText('ImpactedFiles Component')
      ).not.toBeInTheDocument()
    })
  })

  describe('when rendered without changed files or changes', () => {
    beforeEach(() => {
      setup({ overrideData: {} })
    })
    it('renders no changed files text', async () => {
      render(<Root />, { wrapper })

      const warning = await screen.findByText(
        'No Files covered by tests were changed'
      )

      expect(warning).toBeInTheDocument()
      expect(
        screen.queryByText('ImpactedFiles Component')
      ).not.toBeInTheDocument()
    })
  })

  describe('when rendered with head commit errored out', () => {
    beforeEach(() => {
      const overrideData = {
        owner: {
          repository: {
            pull: {
              pullId: 14,
              head: {
                state: CommitStateEnum.ERROR,
              },
            },
          },
        },
      }
      setup({ overrideData })
    })
    it('renders no head commit error text', async () => {
      render(<Root />, { wrapper })

      const error = await screen.findByText(
        'Cannot display changed files because most recent commit is in an error state.'
      )
      expect(error).toBeInTheDocument()
    })
  })

  describe('when loading data', () => {
    beforeEach(() => {
      setup()
    })

    it('shows loading spinner', () => {
      render(<Root />, { wrapper })

      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })
  })
})
