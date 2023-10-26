import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import IndirectChangedFiles from './IndirectChangedFiles'

jest.mock('../FileDiff', () => () => 'FileDiff Component')

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
    },
    patchCoverage: {
      percentCovered: 27.43,
    },
  },
]

const mockPull = {
  owner: {
    repository: {
      pull: {
        pullId: 14,
        head: {
          state: 'PROCESSED',
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
          changeCoverage: 38.94,
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: mockImpactedFiles,
          },
        },
      },
    },
  },
}

const mockNoImpactedFiles = {
  owner: {
    repository: {
      pull: {
        pullId: 14,
        head: {
          state: 'PROCESSED',
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
          changeCoverage: 38.94,
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [],
          },
        },
      },
    },
  },
}

const mockNoChange = {
  owner: {
    repository: {
      pull: {
        pullId: 14,
        head: {
          state: 'PROCESSED',
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
          changeCoverage: 38.94,
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              {
                isCriticalFile: true,
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
              },
            ],
          },
        },
      },
    },
  },
}

const mockSingularImpactedFilesData = {
  owner: {
    repository: {
      pull: {
        compareWithBase: {
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

describe('IndirectChangedFiles', () => {
  function setup(overrideData) {
    server.use(
      graphql.query('Pull', (req, res, ctx) => {
        if (overrideData) {
          return res(ctx.status(200), ctx.data(overrideData))
        }

        return res(ctx.status(200), ctx.data(mockPull))
      }),

      graphql.query('ImpactedFileComparison', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockSingularImpactedFilesData))
      )
    )
  }

  describe('when rendered with impacted files', () => {
    beforeEach(() => setup())
    it('renders spinner', () => {
      render(<IndirectChangedFiles />, { wrapper: wrapper() })

      const spinner = screen.getByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })

    describe('renders the headers of the table', () => {
      it('renders name column', async () => {
        render(<IndirectChangedFiles />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const name = await screen.findByText('Name')
        expect(name).toBeInTheDocument()
      })

      it('renders misses column', async () => {
        render(<IndirectChangedFiles />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const head = await screen.findByText('Missed lines')
        expect(head).toBeInTheDocument()
      })

      it('renders HEAD column', async () => {
        render(<IndirectChangedFiles />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const head = await screen.findByText('HEAD %')
        expect(head).toBeInTheDocument()
      })

      it('does not render patch column', async () => {
        render(<IndirectChangedFiles />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const patch = screen.queryByText('Patch %')
        expect(patch).not.toBeInTheDocument()
      })

      it('renders change', async () => {
        render(<IndirectChangedFiles />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )
        const change = await screen.findByText('Change')
        expect(change).toBeInTheDocument()
      })
    })

    describe('rendering the file content', () => {
      it('renders the file name', async () => {
        render(<IndirectChangedFiles />, { wrapper: wrapper() })

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

      it('renders change coverage', async () => {
        render(<IndirectChangedFiles />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const changeCoverage = await screen.findByText(/44.85%/i)
        expect(changeCoverage).toBeInTheDocument()
      })

      it('renders critical file label', async () => {
        render(<IndirectChangedFiles />, { wrapper: wrapper() })

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
      render(<IndirectChangedFiles />, { wrapper: wrapper() })

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
      setup(mockNoChange)
    })

    it('renders no data for the change', async () => {
      render(<IndirectChangedFiles />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const noData = await screen.findByText('No data')
      expect(noData).toBeInTheDocument()
    })
  })

  describe('when rendered with an empty list of impacted files', () => {
    beforeEach(() => {
      setup(mockNoImpactedFiles)
    })

    it('renders name column', async () => {
      render(<IndirectChangedFiles />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const name = await screen.findByText('Name')
      expect(name).toBeInTheDocument()
    })

    it('renders HEAD column', async () => {
      render(<IndirectChangedFiles />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const head = await screen.findByText('HEAD %')
      expect(head).toBeInTheDocument()
    })

    it('renders change', async () => {
      render(<IndirectChangedFiles />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
      const change = await screen.findByText('Change')
      expect(change).toBeInTheDocument()
    })
  })
})
