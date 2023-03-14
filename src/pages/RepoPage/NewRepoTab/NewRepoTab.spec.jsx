import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRedirect } from 'shared/useRedirect'

import NewRepoTab from './NewRepoTab'

jest.mock('shared/useRedirect')

const mockCurrentUser = {
  me: {
    trackingMetadata: {
      ownerid: 'user-owner-id',
    },
  },
}

const mockGetRepo = (noUploadToken, hasCommits) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      private: false,
      uploadToken: noUploadToken
        ? null
        : '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
      active: hasCommits,
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})
const server = setupServer()
let testLocation

const wrapper =
  (initialEntries = '/gh/codecov/cool-repo/new') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route
            path={[
              '/:provider/:owner/:repo/new',
              '/:provider/:owner/:repo/new/other-ci',
            ]}
          >
            <Suspense fallback={null}>{children}</Suspense>
          </Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  console.error = () => {}
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('NewRepoTab', () => {
  function setup(
    { hasCommits, noUploadToken } = { hasCommits: false, noUploadToken: false }
  ) {
    const hardRedirect = jest.fn()
    useRedirect.mockImplementation((data) => ({
      hardRedirect: () => hardRedirect(data),
    }))

    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockGetRepo(noUploadToken, hasCommits)))
      ),
      graphql.query('CurrentUser', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockCurrentUser))
      )
    )

    return { hardRedirect }
  }

  describe('rendering component', () => {
    beforeEach(() => setup())

    it('renders header', async () => {
      render(<NewRepoTab />, { wrapper: wrapper() })

      const header = await screen.findByRole('heading', {
        name: /Let's get your repo covered/,
      })
      expect(header).toBeInTheDocument()
    })

    it('renders github actions tab', async () => {
      render(<NewRepoTab />, { wrapper: wrapper() })

      const tab = await screen.findByRole('link', { name: 'GitHub Actions' })
      expect(tab).toBeInTheDocument()
      expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/new')
    })

    it('renders other ci tab', async () => {
      render(<NewRepoTab />, { wrapper: wrapper() })

      const tab = await screen.findByRole('link', { name: 'Other CI' })
      expect(tab).toBeInTheDocument()
      expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/new/other-ci')
    })
  })

  describe('testing redirects', () => {
    describe('repo has commits', () => {
      beforeEach(() => setup({ hasCommits: true }))

      it('redirects to repo page', async () => {
        render(<NewRepoTab />, { wrapper: wrapper() })

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo')
        )
      })
    })

    describe('repo does not have an upload token', () => {
      it('redirects to provider', async () => {
        const { hardRedirect } = setup({ noUploadToken: true })
        render(<NewRepoTab />, { wrapper: wrapper() })

        await waitFor(() => expect(hardRedirect).toBeCalled())
      })

      it('displays 404', async () => {
        setup({ noUploadToken: true })
        render(<NewRepoTab />, { wrapper: wrapper() })

        const fourOhFour = await screen.findByText('Not found')
        expect(fourOhFour).toBeInTheDocument()
      })
    })
  })

  describe('testing tab navigation', () => {
    describe('clicking on other ci', () => {
      beforeEach(() => setup())

      it('navigates to /other-ci', async () => {
        const user = userEvent.setup()
        render(<NewRepoTab />, { wrapper: wrapper() })

        const tab = await screen.findByRole('link', { name: 'Other CI' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/new/other-ci'
        )

        await user.click(tab)

        expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/new/other-ci')
      })
    })

    describe('clicking on github actions', () => {
      beforeEach(() => setup())

      it('navigates to /new', async () => {
        const user = userEvent.setup()
        render(<NewRepoTab />, {
          wrapper: wrapper('/gh/codecov/cool-repo/new/other-ci'),
        })

        const tab = await screen.findByRole('link', { name: 'GitHub Actions' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/new')

        await user.click(tab)

        expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/new')
      })
    })
  })
})
