import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { PropsWithChildren, Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRedirect } from 'shared/useRedirect'

import NewRepoTab from './NewRepoTab'

jest.mock('shared/useRedirect')
const mockedUseRedirect = useRedirect as jest.Mock
jest.mock('./GitHubActions', () => () => 'GitHubActions')
jest.mock('./OtherCI', () => () => 'OtherCI')
jest.mock('./ActivationBanner', () => () => 'ActivationBanner')


const mockCurrentUser = {
  me: {
    trackingMetadata: {
      ownerid: 'user-owner-id',
    },
  },
}

const mockGetRepo = (noUploadToken = false, hasCommits = false) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    isAdmin: null,
    isCurrentUserActivated: null,
    repository: {
      __typename: 'Repository',
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
      retry: false,
    },
  },
})
const server = setupServer()
let testLocation: any

const wrapper: (initialEntries?: string) => React.FC<PropsWithChildren> =
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
  // console.error = () => {}
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

interface SetupArgs {
  hasCommits?: boolean
  noUploadToken?: boolean
}

describe('NewRepoTab', () => {
  function setup({ hasCommits = false, noUploadToken = false }: SetupArgs) {
    const user = userEvent.setup()
    const hardRedirect = jest.fn()
    mockedUseRedirect.mockImplementation((data) => ({
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

    return { hardRedirect, user }
  }

  describe('intro blurb', () => {
    it('renders', async () => {
      setup({})
      render(<NewRepoTab />, { wrapper: wrapper() })

      const intro = await screen.findByTestId('intro-blurb')
      expect(intro).toBeInTheDocument()
    })
  })

  describe('rendering component', () => {
    beforeEach(() => setup({}))

    it('renders header', async () => {
      render(<NewRepoTab />, { wrapper: wrapper() })

      const header = await screen.findByRole('heading', {
        name: /Let's get your repo covered/,
      })
      expect(header).toBeInTheDocument()
    })

    it('renders ActivationBanner', async () => {
      render(<NewRepoTab />, { wrapper: wrapper() })

      const banner = await screen.findByText('ActivationBanner')
      expect(banner).toBeInTheDocument()
    })

    describe('users provider is github', () => {
      it('renders github actions tab', async () => {
        render(<NewRepoTab />, { wrapper: wrapper() })

        const content = await screen.findByText('GitHubActions')
        expect(content).toBeInTheDocument()

        const tab = await screen.findByRole('link', { name: 'GitHub Actions' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/new')
      })

      it('renders other ci tab', async () => {
        render(<NewRepoTab />, { wrapper: wrapper() })

        const content = await screen.findByText('GitHubActions')
        expect(content).toBeInTheDocument()

        const tab = await screen.findByRole('link', { name: 'Other CI' })
        expect(tab).toBeInTheDocument()
        expect(tab).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/new/other-ci'
        )
      })
    })

    describe('users provider is not github', () => {
      it('does not render github actions tab', async () => {
        render(<NewRepoTab />, {
          wrapper: wrapper('/gl/codecov/cool-repo/new'),
        })

        const content = await screen.findByText('OtherCI')
        expect(content).toBeInTheDocument()

        const tab = screen.queryByRole('link', { name: 'GitHub Actions' })
        expect(tab).not.toBeInTheDocument()
      })

      it('does not render other ci tab', async () => {
        render(<NewRepoTab />, {
          wrapper: wrapper('/gl/codecov/cool-repo/new'),
        })

        const content = await screen.findByText('OtherCI')
        expect(content).toBeInTheDocument()

        const tab = screen.queryByRole('link', { name: 'Other CI' })
        expect(tab).not.toBeInTheDocument()
      })
    })
  })

  describe('testing redirects', () => {
    describe('repo does not have an upload token', () => {
      it('redirects to provider', async () => {
        const { hardRedirect } = setup({ noUploadToken: true })
        render(<NewRepoTab />, { wrapper: wrapper() })

        await waitFor(() => expect(hardRedirect).toHaveBeenCalled())
      })

      it('displays 404', async () => {
        setup({ noUploadToken: true })
        render(<NewRepoTab />, { wrapper: wrapper() })

        const fourOhFour = await screen.findByText('Not found')
        expect(fourOhFour).toBeInTheDocument()
      })
    })
  })

  describe('users provider is github', () => {
    describe('testing tab navigation', () => {
      describe('clicking on other ci', () => {
        it('navigates to /other-ci', async () => {
          const { user } = setup({})
          render(<NewRepoTab />, { wrapper: wrapper() })

          const tab = await screen.findByRole('link', { name: 'Other CI' })
          expect(tab).toBeInTheDocument()
          expect(tab).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/new/other-ci'
          )

          await user.click(tab)

          expect(testLocation.pathname).toBe(
            '/gh/codecov/cool-repo/new/other-ci'
          )

          const content = await screen.findByText('OtherCI')
          expect(content).toBeInTheDocument()
        })
      })

      describe('clicking on github actions', () => {
        it('navigates to /new', async () => {
          const { user } = setup({})
          render(<NewRepoTab />, {
            wrapper: wrapper('/gh/codecov/cool-repo/new/other-ci'),
          })

          const tab = await screen.findByRole('link', {
            name: 'GitHub Actions',
          })
          expect(tab).toBeInTheDocument()
          expect(tab).toHaveAttribute('href', '/gh/codecov/cool-repo/new')

          await user.click(tab)

          expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/new')

          const content = await screen.findByText('GitHubActions')
          expect(content).toBeInTheDocument()
        })
      })
    })
  })
})
