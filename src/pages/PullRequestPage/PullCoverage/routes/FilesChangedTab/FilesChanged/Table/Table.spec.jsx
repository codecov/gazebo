import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Table from './Table'

jest.mock('../../shared/FileDiff', () => () => 'FileDiff Component')

const mockImpactedFiles = [
  {
    isCriticalFile: true,
    missesCount: 3,
    fileName: 'mafs.js',
    headName: 'flag1/mafs.js',
    baseCoverage: {
      percentCovered: 45.38,
    },
    headCoverage: {
      percentCovered: 90.23,
    },
    patchCoverage: {
      percentCovered: 27.43,
    },
    changeCoverage: 41,
  },
]

const mockPull = ({ overrideComparison } = {}) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      defaultBranch: 'main',
      private: false,
      pull: {
        commits: {
          edges: [
            {
              node: {
                state: 'complete',
                commitid: 'fc43199ccde1f21a940aa3d596c711c1c420651f',
                message:
                  'create component to hold bundle list table for a given pull 2',
                author: {
                  username: 'nicholas-codecov',
                },
              },
            },
          ],
        },
        compareWithBase: overrideComparison
          ? overrideComparison
          : {
              state: 'complete',
              __typename: 'Comparison',
              flagComparisons: [],
              patchTotals: {
                percentCovered: 92.12,
              },
              baseTotals: {
                percentCovered: 98.25,
              },
              headTotals: {
                percentCovered: 78.33,
              },
              impactedFiles: {
                __typename: 'ImpactedFiles',
                results: mockImpactedFiles,
              },
              changeCoverage: 38.94,
              hasDifferentNumberOfHeadAndBaseReports: true,
            },
        pullId: 2510,
        title: 'feat: Create bundle analysis table for a given pull',
        state: 'OPEN',
        author: {
          username: 'nicholas-codecov',
        },
        head: {
          ciPassed: true,
          branchName:
            'gh-eng-994-create-bundle-analysis-table-for-a-given-pull',
          state: 'complete',
          commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
          totals: {
            percentCovered: 78.33,
          },
          uploads: {
            totalCount: 4,
          },
        },
        updatestamp: '2024-01-12T12:56:18.912860',
        behindBy: 82367894,
        behindByCommit: '1798hvs8ofhn',
        comparedTo: {
          commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
          uploads: {
            totalCount: 1,
          },
        },
      },
    },
  },
})

const mockSingularTableData = {
  owner: {
    repository: {
      pull: {
        pullId: 14,
        compareWithBase: {
          __typename: 'Comparison',
          impactedFile: {
            headName: 'file A',
            isNewFile: true,
            isRenamedFile: false,
            isDeletedFile: false,
            isCriticalFile: false,
            headCoverage: {
              percentCovered: 90.23,
            },
            baseCoverage: {
              percentCovered: 23.42,
            },
            patchCoverage: {
              percentCovered: 27.43,
            },
            changeCoverage: 58.333333333333336,
            segments: [
              {
                header: '@@ -0,0 1,45 @@',
                lines: [
                  {
                    baseNumber: null,
                    headNumber: '1',
                    baseCoverage: null,
                    headCoverage: 'H',
                    content: 'export default class Calculator {',
                  },
                ],
              },
            ],
          },
        },
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const wrapper =
  (initialEntries = ['/gh/test-org/test-repo/pull/12']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

describe('Table', () => {
  function setup({ overrideComparison } = {}) {
    server.use(
      graphql.query('Pull', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockPull({ overrideComparison })))
      }),

      graphql.query('ImpactedFileComparison', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockSingularTableData))
      )
    )
  }

  describe('when rendered with changed files', () => {
    beforeEach(() => setup())
    it('renders spinner', () => {
      render(<Table />, { wrapper: wrapper() })

      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })

    describe('renders the headers of the table', () => {
      it('renders name column', async () => {
        render(<Table />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const name = await screen.findByText('Name')
        expect(name).toBeInTheDocument()
      })

      it('renders HEAD column', async () => {
        render(<Table />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const head = await screen.findByText('HEAD %')
        expect(head).toBeInTheDocument()
      })

      it('renders patch column', async () => {
        render(<Table />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const patch = await screen.findByText('Patch %')
        expect(patch).toBeInTheDocument()
      })

      it('renders change', async () => {
        render(<Table />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )
        const change = await screen.findByText('Change')
        expect(change).toBeInTheDocument()
      })
    })

    describe('rendering the file content', () => {
      it('renders the file name', async () => {
        render(<Table />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const link = await screen.findByRole('link', {
          name: 'flag1/mafs.js',
        })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/gh/test-org/test-repo/pull/12/blob/flag1/mafs.js'
        )
      })

      it('renders file coverage', async () => {
        render(<Table />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const fileCoverage = await screen.findByText(/90.23%/i)
        expect(fileCoverage).toBeInTheDocument()
      })

      it('renders patch coverage', async () => {
        render(<Table />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const patchCoverage = await screen.findByText(/27.43%/i)
        expect(patchCoverage).toBeInTheDocument()
      })

      it('renders change coverage', async () => {
        render(<Table />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const changeCoverage = await screen.findByText(/44.85%/i)
        expect(changeCoverage).toBeInTheDocument()
      })

      it('renders critical file label', async () => {
        render(<Table />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const criticalFileLabel = await screen.findByText(/Critical File/i)
        expect(criticalFileLabel).toBeInTheDocument()
      })
    })
  })

  describe('when expanding the name column', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the FileDiff component', async () => {
      const user = userEvent.setup()
      render(<Table />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const nameExpander = await screen.findByTestId('name-expand')
      await user.click(nameExpander)

      const fileDiff = await screen.findByText('FileDiff Component')
      expect(fileDiff).toBeInTheDocument()
    })
  })

  describe('when rendered without change', () => {
    beforeEach(() => {
      setup({
        overrideComparison: {
          state: 'complete',
          __typename: 'Comparison',
          flagComparisons: [],
          patchTotals: {
            percentCovered: 33,
          },
          baseTotals: {
            percentCovered: 77,
          },
          headTotals: {
            percentCovered: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              {
                isCriticalFile: true,
                missesCount: 3,
                fileName: 'mafs.js',
                headName: 'flag1/mafs.js',
                baseCoverage: {
                  percentCovered: null,
                },
                headCoverage: {
                  percentCovered: null,
                },
                patchCoverage: {
                  percentCovered: null,
                },
                changeCoverage: null,
              },
            ],
          },
          changeCoverage: null,
          hasDifferentNumberOfHeadAndBaseReports: true,
        },
      })
    })

    it('renders no data for the change', async () => {
      render(<Table />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const noData = await screen.findByText('No data')
      expect(noData).toBeInTheDocument()
    })
  })

  describe('when rendered with an empty list of changed files', () => {
    beforeEach(() => {
      setup()
    })

    it('renders name column', async () => {
      render(<Table />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const name = await screen.findByText('Name')
      expect(name).toBeInTheDocument()
    })

    it('renders HEAD column', async () => {
      render(<Table />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const head = await screen.findByText('HEAD %')
      expect(head).toBeInTheDocument()
    })

    it('renders patch column', async () => {
      render(<Table />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const patch = await screen.findByText('Patch %')
      expect(patch).toBeInTheDocument()
    })

    it('renders change', async () => {
      render(<Table />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
      const change = await screen.findByText('Change')
      expect(change).toBeInTheDocument()
    })
  })
})
