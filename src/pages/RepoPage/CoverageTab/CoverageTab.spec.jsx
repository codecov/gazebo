import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CoverageTab from './CoverageTab'

jest.mock('./Summary', () => () => 'Summary Component')
jest.mock('./subroute/Fileviewer', () => () => 'Fileviewer Component')
jest.mock('./subroute/RepoContents', () => () => 'RepoContents Component')
jest.mock('./subroute/Chart', () => () => 'Chart Component')
jest.mock('./subroute/Sunburst', () => () => 'Sunburst Component')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
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

const mockRepo = {
  owner: {
    repository: {
      defaultBranch: 'main',
    },
  },
}

const wrapper =
  ({ initialEntries }) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </QueryClientProvider>
    )

describe('Coverage Tab', () => {
  function setup({ repoData = mockRepo } = { repoData: mockRepo }) {
    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(repoData))
      )
    )
  }

  describe('when rendered with default route', () => {
    beforeEach(() => {
      setup()
    })

    it('renders summary, and root tree component', () => {
      render(
        <>
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+" exact>
            Un expected Render{' '}
          </Route>
          <Route path="/:provider/:owner/:repo/tree/:branch" exact>
            Un expected Render
          </Route>
          <Route path="/:provider/:owner/:repo/blob/:ref/:path+">
            Un expected Render
          </Route>
          <Route path="/:provider/:owner/:repo" exact={true}>
            <CoverageTab />
          </Route>
        </>,
        { wrapper: wrapper({ initialEntries: ['/gh/test-org/test-repo/'] }) }
      )

      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with tree+branch on default route returns the root of the project', () => {
    beforeEach(() => {
      setup()
    })

    it('renders summary and root tree component', () => {
      render(
        <>
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+" exact>
            Un expected Render{' '}
          </Route>
          <Route path="/:provider/:owner/:repo/tree/:branch" exact>
            <CoverageTab />
          </Route>
          <Route path="/:provider/:owner/:repo/blob/:ref/:path+">
            Un expected Render
          </Route>
          <Route path="/:provider/:owner/:repo" exact={true}>
            Un expected Render{' '}
          </Route>
        </>,
        {
          wrapper: wrapper({
            initialEntries: ['/gh/test-org/test-repo/tree/some-branch'],
          }),
        }
      )

      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/RepoContents Component/)).toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with tree+branch route returns the root of that branch', () => {
    beforeEach(() => {
      setup()
    })

    it('renders summary and root tree component', () => {
      render(
        <>
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+" exact>
            Un expected Render{' '}
          </Route>
          <Route path="/:provider/:owner/:repo/tree/:branch" exact>
            <CoverageTab />
          </Route>
          <Route path="/:provider/:owner/:repo/blob/:ref/:path+">
            Un expected Render
          </Route>
          <Route path="/:provider/:owner/:repo" exact={true}>
            Un expected Render{' '}
          </Route>
        </>,
        {
          wrapper: wrapper({
            initialEntries: ['/gh/test-org/test-repo/tree/main'],
          }),
        }
      )

      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/RepoContents Component/)).toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with tree+branch route on a sub folder', () => {
    beforeEach(() => {
      setup()
    })

    it('renders summary and root tree component', () => {
      render(
        <>
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+" exact>
            <CoverageTab />{' '}
          </Route>
          <Route path="/:provider/:owner/:repo/tree/:branch" exact>
            Un expected Render
          </Route>
          <Route path="/:provider/:owner/:repo/blob/:ref/:path+">
            Un expected Render
          </Route>
          <Route path="/:provider/:owner/:repo" exact={true}>
            Un expected Render{' '}
          </Route>
        </>,
        {
          wrapper: wrapper({
            initialEntries: ['/gh/test-org/test-repo/tree/master/src'],
          }),
        }
      )

      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/RepoContents Component/)).toBeInTheDocument()
      expect(screen.queryByText(/Fileviewer Component/)).not.toBeInTheDocument()
    })
  })

  describe('when rendered with blob route', () => {
    beforeEach(() => {
      setup()
    })

    it('renders summary and root tree component', async () => {
      render(
        <>
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+" exact>
            Un expected Render
          </Route>
          <Route path="/:provider/:owner/:repo/tree/:branch" exact>
            Un expected Render
          </Route>
          <Route path="/:provider/:owner/:repo/blob/:ref/:path+">
            <CoverageTab />
          </Route>
          <Route path="/:provider/:owner/:repo" exact={true}>
            Un expected Render{' '}
          </Route>
        </>,
        {
          wrapper: wrapper({
            initialEntries: [
              '/gh/test-org/test-repo/blob/main/path/to/file.js',
            ],
          }),
        }
      )

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      expect(screen.getByText(/Summary Component/)).toBeInTheDocument()
      expect(screen.getByText(/Fileviewer Component/)).toBeInTheDocument()
      expect(
        screen.queryByText(/RepoContents Component/)
      ).not.toBeInTheDocument()
    })
  })
})
