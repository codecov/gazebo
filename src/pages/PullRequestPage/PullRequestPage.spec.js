import { render, screen, waitFor } from 'custom-testing-library'

import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import PullRequestPage from './PullRequestPage'

jest.mock('./Header', () => () => 'Header')
jest.mock('./Summary', () => () => 'CompareSummary')
jest.mock('./Flags', () => () => 'Flags')
jest.mock('./Commits', () => () => 'Commits')

jest.mock('./subroute/Root', () => () => 'Root')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('PullRequestPage', () => {
  function setup({
    privateRepo = false,
    initialEntries = ['/gh/test-org/test-repo/pull/12'],
  }) {
    console.log(privateRepo, initialEntries)
    server.use(
      graphql.query('pull', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              isCurrentUserPartOfOrg: false,
              repository: { private: privateRepo },
            },
          })
        )
      })
    )

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId" exact={true}>
          <PullRequestPage />
        </Route>
        <Route path="/:provider/:owner/:repo/pull/:pullId/tree/:path">
          <PullRequestPage />
        </Route>
      </MemoryRouter>,
      { wrapper }
    )
  }

  describe('show 404 if repo is private and user not part of the org', () => {
    describe('the main breadcrumb', () => {
      beforeEach(() => {
        setup({ privateRepo: true })
      })

      it('renders', () => {
        expect(
          screen.queryByRole('link', {
            name: /test-org/i,
          })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('link', {
            name: /test-repo/i,
          })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('link', {
            name: /pulls/i,
          })
        ).not.toBeInTheDocument()
      })
    })

    describe('root', () => {
      beforeEach(async () => {
        setup({ privateRepo: true })
        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )
      })

      it('rendered', () => {
        expect(screen.getByText(/404/i)).toBeInTheDocument()
      })
    })
  })

  describe('the main breadcrumb', () => {
    beforeEach(() => {
      setup({
        privateRepo: false,
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
      })
    })

    it('renders', () => {
      expect(
        screen.getByRole('link', {
          name: /test-org/i,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: /test-repo/i,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: /pulls/i,
        })
      ).toBeInTheDocument()
    })
  })

  describe('root', () => {
    beforeEach(async () => {
      setup()
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('rendered', () => {
      expect(screen.getByText(/Root/i)).toBeInTheDocument()
    })
  })

  describe('compare summary', () => {
    beforeEach(async () => {
      setup({
        privateRepo: false,
        initialEntries: ['/gh/test-org/test-repo/pull/12/tree/App/index.js'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders', () => {
      expect(screen.getByText(/CompareSummary/i)).toBeInTheDocument()
    })
  })

  describe('header', () => {
    beforeEach(async () => {
      setup({
        privateRepo: false,
        initialEntries: ['/gh/test-org/test-repo/pull/12/tree/App/index.js'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders', () => {
      expect(screen.getByText(/Header/i)).toBeInTheDocument()
    })
  })

  describe('flags', () => {
    beforeEach(async () => {
      setup({
        privateRepo: false,
        initialEntries: ['/gh/test-org/test-repo/pull/12/tree/App/index.js'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders', () => {
      expect(screen.getByText(/Flags/i)).toBeInTheDocument()
    })
  })

  describe('commits', () => {
    beforeEach(async () => {
      setup({
        privateRepo: false,
        initialEntries: ['/gh/test-org/test-repo/pull/12/tree/App/index.js'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders', () => {
      expect(screen.getByText(/Commits/i)).toBeInTheDocument()
    })
  })
})
