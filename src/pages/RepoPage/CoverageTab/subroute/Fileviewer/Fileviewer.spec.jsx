import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import { useScrollToLine } from 'ui/CodeRenderer/hooks/useScrollToLine'

import FileView from './Fileviewer'

jest.mock('shared/featureFlags')
jest.mock('ui/CodeRenderer/hooks/useScrollToLine')

const mockRepoSettings = (isPrivate) => ({
  owner: {
    repository: {
      defaultBranch: 'main',
      private: isPrivate,
      uploadToken: 'token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
    },
  },
})

const mockOwner = {
  username: 'cool-user',
}

const mockOverview = {
  owner: {
    repository: {
      defaultBranch: 'main',
    },
  },
}

const mockCoverage = {
  commit: {
    commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
    flagNames: ['a', 'b'],
    coverageFile: {
      content:
        'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n\n\n\n',
      coverage: [
        {
          line: 1,
          coverage: 'H',
        },
        {
          line: 2,
          coverage: 'H',
        },
        {
          line: 4,
          coverage: 'H',
        },
        {
          line: 5,
          coverage: 'H',
        },
        {
          line: 7,
          coverage: 'H',
        },
        {
          line: 8,
          coverage: 'H',
        },
      ],
    },
  },
  branch: null,
}

const mockFlagResponse = {
  owner: {
    repository: {
      flags: {
        edges: [
          {
            node: {
              name: 'flag-2',
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  },
}

const mockBackfillResponse = {
  config: {
    isTimeScaleEnabled: true,
  },
  owner: {
    repository: {
      flagsMeasurementsActive: true,
      flagsMeasurementsBackfilled: true,
      flagsCount: 1,
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (
    initialEntries = [
      '/gh/criticalrole/mightynein/blob/branchName/folder/file.js',
    ]
  ) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/blob/:ref/:path+">
            {children}
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

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

describe('FileView', () => {
  function setup(
    { tierName = TierNames.PRO, isPrivate = false } = {
      tierName: TierNames.PRO,
      isPrivate: false,
    }
  ) {
    useScrollToLine.mockImplementation(() => ({
      lineRef: () => {},
      handleClick: jest.fn(),
      targeted: false,
    }))

    useFlags.mockReturnValue({
      coverageTabFlagMutliSelect: true,
    })

    server.use(
      graphql.query('DetailOwner', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: mockOwner }))
      ),
      graphql.query('CoverageForFile', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: { repository: mockCoverage } }))
      ),
      graphql.query('GetRepoOverview', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockOverview))
      ),
      graphql.query('BackfillFlagMemberships', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockBackfillResponse))
      }),
      graphql.query('FlagsSelect', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockFlagResponse))
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({ owner: { plan: { tierName: tierName } } })
        )
      }),
      graphql.query('GetRepoSettingsTeam', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoSettings(isPrivate)))
      })
    )
  }

  describe('rendering component', () => {
    describe('displaying the tree path', () => {
      it('displays repo link', async () => {
        setup()
        render(<FileView />, { wrapper: wrapper() })

        const repoName = await screen.findByRole('link', { name: 'mightynein' })
        expect(repoName).toBeInTheDocument()
        expect(repoName).toHaveAttribute(
          'href',
          '/gh/criticalrole/mightynein/tree/branchName/'
        )
      })

      it('displays directory link', async () => {
        setup()
        render(<FileView />, { wrapper: wrapper() })

        const repoName = await screen.findByRole('link', { name: 'folder' })
        expect(repoName).toBeInTheDocument()
        expect(repoName).toHaveAttribute(
          'href',
          '/gh/criticalrole/mightynein/tree/branchName/folder'
        )
      })

      it('displays file name', async () => {
        setup()
        render(<FileView />, { wrapper: wrapper() })

        const fileName = await screen.findByText('file.js')
        expect(fileName).toBeInTheDocument()
      })
    })

    describe('displaying the file viewer', () => {
      it('sets the correct url link', async () => {
        setup()
        render(<FileView />, { wrapper: wrapper() })

        const copyLink = await screen.findByRole('link', {
          name: 'folder/file.js',
        })
        expect(copyLink).toBeInTheDocument()
        expect(copyLink).toHaveAttribute('href', '#folder/file.js')
      })
    })

    describe('displaying the flag selector', () => {
      describe('user is not on a team plan', () => {
        it('renders the flag multi select', async () => {
          setup()
          render(<FileView />, { wrapper: wrapper() })

          const select = await screen.findByText('All flags')
          expect(select).toBeInTheDocument()
        })
      })

      describe('on a team plan', () => {
        describe('repo is public', () => {
          it('renders the flag multi select', async () => {
            setup({ tierName: TierNames.TEAM, isPrivate: false })

            render(<FileView />, { wrapper: wrapper() })

            const select = await screen.findByText('All flags')
            expect(select).toBeInTheDocument()
          })
        })

        describe('repo is private', () => {
          it('does not render the flag multi select', async () => {
            setup({ tierName: TierNames.TEAM, isPrivate: true })
            render(<FileView />, { wrapper: wrapper() })

            await waitFor(() => queryClient.isFetching)
            await waitFor(() => !queryClient.isFetching)

            await waitFor(() =>
              expect(screen.queryByText('All flags')).not.toBeInTheDocument()
            )
          })
        })
      })
    })
  })
})
