import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import PullRequestPageContent from './PullRequestPageContent'

import { ComparisonReturnType } from '../ErrorBanner/constants'

jest.mock('../subroute/FilesChangedTab', () => () => 'FilesChangedTab')
jest.mock('../subroute/IndirectChangesTab', () => () => 'IndirectChangesTab')
jest.mock('../subroute/CommitsTab', () => () => 'CommitsTab')
jest.mock('../subroute/FlagsTab', () => () => 'FlagsTab')

const mockPullData = (resultType) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      private: false,
      pull: {
        pullId: 1,
        compareWithBase: {
          __typename: resultType,
          impactedFilesCount: 2,
          indirectChangedFilesCount: 3,
          directChangedFilesCount: 4,
          flagComparisonsCount: 5,
        },
      },
    },
  },
})

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (initialEntries = '/gh/codecov/test-repo/pull/1') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
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

describe('PullRequestPageContent', () => {
  function setup(resultType = ComparisonReturnType.SUCCESSFUL_COMPARISON) {
    server.use(
      graphql.query('PullPageData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockPullData(resultType)))
      )
    )
  }

  describe('result type was not successful', () => {
    beforeEach(() => setup(ComparisonReturnType.MISSING_BASE_COMMIT))

    it('renders an error banner', async () => {
      render(<PullRequestPageContent />, { wrapper: wrapper() })

      const errorBanner = await screen.findByRole('heading', {
        name: 'Missing Base Commit',
      })
      expect(errorBanner).toBeInTheDocument()
    })
  })

  describe('result type was successful', () => {
    beforeEach(() => setup())

    describe('on the indirect changes path', () => {
      it('renders indirect changes tab', async () => {
        render(<PullRequestPageContent />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/indirect-changes'),
        })

        const indirectChanges = await screen.findByText('IndirectChangesTab')
        expect(indirectChanges).toBeInTheDocument()
      })
    })

    describe('on the commits path', () => {
      it('renders the commits tab', async () => {
        render(<PullRequestPageContent />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/commits'),
        })

        const commitsTab = await screen.findByText('CommitsTab')
        expect(commitsTab).toBeInTheDocument()
      })
    })

    describe('on the flags path', () => {
      it('renders the flags tab', async () => {
        render(<PullRequestPageContent />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/flags'),
        })

        const flagsTab = await screen.findByText('FlagsTab')
        expect(flagsTab).toBeInTheDocument()
      })
    })

    describe('on the root path', () => {
      it('renders files changed tab', async () => {
        render(<PullRequestPageContent />, { wrapper: wrapper() })

        const filesChangedTab = await screen.findByText('FilesChangedTab')
        expect(filesChangedTab).toBeInTheDocument()
      })
    })

    describe('on a random path', () => {
      it('redirects to the files changed tab', async () => {
        render(<PullRequestPageContent />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/blah'),
        })

        const filesChangedTab = await screen.findByText('FilesChangedTab')
        expect(filesChangedTab).toBeInTheDocument()
      })
    })
  })
})
