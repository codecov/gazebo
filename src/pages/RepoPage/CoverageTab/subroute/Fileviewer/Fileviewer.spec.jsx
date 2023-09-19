import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useScrollToLine } from 'ui/CodeRenderer/hooks/useScrollToLine'

import FileView from './Fileviewer'

jest.mock('ui/CodeRenderer/hooks/useScrollToLine')

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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

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
  function setup() {
    useScrollToLine.mockImplementation(() => ({
      lineRef: () => {},
      handleClick: jest.fn(),
      targeted: false,
    }))

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
      })
    )
  }

  describe('rendering component', () => {
    beforeEach(() => setup())

    describe('displaying the tree path', () => {
      it('displays repo link', async () => {
        render(<FileView />, { wrapper: wrapper() })

        const repoName = await screen.findByRole('link', { name: 'mightynein' })
        expect(repoName).toBeInTheDocument()
        expect(repoName).toHaveAttribute(
          'href',
          '/gh/criticalrole/mightynein/tree/branchName/'
        )
      })

      it('displays directory link', async () => {
        render(<FileView />, { wrapper: wrapper() })

        const repoName = await screen.findByRole('link', { name: 'folder' })
        expect(repoName).toBeInTheDocument()
        expect(repoName).toHaveAttribute(
          'href',
          '/gh/criticalrole/mightynein/tree/branchName/folder'
        )
      })

      it('displays file name', async () => {
        render(<FileView />, { wrapper: wrapper() })

        const fileName = await screen.findByText('file.js')
        expect(fileName).toBeInTheDocument()
      })
    })

    describe('displaying the file viewer', () => {
      it('sets the correct url link', async () => {
        render(<FileView />, { wrapper: wrapper() })

        const copyLink = await screen.findByRole('link', {
          name: 'folder/file.js',
        })
        expect(copyLink).toBeInTheDocument()
        expect(copyLink).toHaveAttribute('href', '#folder/file.js')
      })
    })
  })
})
