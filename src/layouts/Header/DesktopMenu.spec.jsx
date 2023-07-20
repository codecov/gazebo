import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import DesktopMenu, { LoginPrompt } from './DesktopMenu'

jest.mock('config')

const loggedInUser = {
  me: {
    owner: {
      defaultOrgUsername: 'codecov',
    },
    user: {
      username: 'p',
      avatarUrl: '',
    },
  },
}

const mockSeatData = {
  config: {
    seatsUsed: 5,
    seatsLimit: 10,
  },
}

const mockSelfHostedUser = {
  activated: true,
  email: 'codecov@codecov.io',
  isAdmin: true,
  name: 'Codecov',
  ownerid: 2,
  username: 'codecov',
}

// silence console errors
console.error = () => {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (
    { initialEntries = '/gh', path = '/:provider' } = {
      initialEntries: '/gh',
      path: '/:provider',
    }
  ) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path={path} exact>
            <DesktopMenu />
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('DesktopMenu', () => {
  function setup({ hasLoggedInUser = true } = { hasLoggedInUser: true }) {
    server.use(
      graphql.query('Seats', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockSeatData))
      ),
      graphql.query('CurrentUser', (req, res, ctx) => {
        if (hasLoggedInUser) {
          return res(ctx.status(200), ctx.data(loggedInUser))
        }
        return res(ctx.status(200), ctx.data({}))
      }),
      rest.get('/internal/users/current', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(mockSelfHostedUser))
      )
    )
  }

  describe('rendering logo button', () => {
    describe('when provider is not present', () => {
      it('directs user to about codecov io', async () => {
        setup()

        render(<DesktopMenu />, {
          wrapper: wrapper({
            initialEntries: '/',
            path: '',
          }),
        })

        const link = await screen.findByTestId('homepage-link')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'https://about.codecov.io')
      })
    })
  })

  it('renders static links', async () => {
    setup()

    render(<DesktopMenu />, {
      wrapper: wrapper({
        initialEntries: '/gh/codecov',
        path: '/:provider/:owner',
      }),
    })

    const desktopMenu = await screen.findByTestId('desktop-menu')

    const docsLink = await within(desktopMenu).findByRole('link', {
      name: 'Docs',
    })
    expect(docsLink).toBeInTheDocument()
    expect(docsLink).toHaveAttribute('href', 'https://docs.codecov.io/')

    const supportLink = await within(desktopMenu).findByRole('link', {
      name: 'Support',
    })
    expect(supportLink).toBeInTheDocument()
    expect(supportLink).toHaveAttribute(
      'href',
      'https://codecovpro.zendesk.com/hc/en-us'
    )

    const blogLink = await within(desktopMenu).findByRole('link', {
      name: 'Blog',
    })
    expect(blogLink).toBeInTheDocument()
    expect(blogLink).toHaveAttribute('href', 'https://about.codecov.io/blog')
  })

  it('renders the dropdown when user is logged in', async () => {
    setup()

    render(<DesktopMenu />, {
      wrapper: wrapper({
        initialEntries: '/gh/codecov',
        path: '/:provider/:owner',
      }),
    })

    const dropdown = await screen.findByTestId('dropdown')
    expect(dropdown).toBeInTheDocument()
  })

  it('does not render request demo button when owner is undefined', async () => {
    setup({ hasLoggedInUser: false })

    render(<DesktopMenu />, {
      wrapper: wrapper({
        initialEntries: '/gh/',
        path: '/:provider/:owner',
      }),
    })

    await waitFor(() => queryClient.isFetching)
    await waitFor(() => !queryClient.isFetching)

    const requestDemo = screen.queryByText(/Request demo/)
    expect(requestDemo).toBeNull()
  })

  it('renders the login prompt when user not logged in', async () => {
    setup({ hasLoggedInUser: false })

    render(<DesktopMenu />, {
      wrapper: wrapper({
        initialEntries: '/gh/',
        path: '/:provider/',
      }),
    })

    await waitFor(() => queryClient.isFetching)
    await waitFor(() => !queryClient.isFetching)

    const login = screen.getByTestId('login-prompt')
    expect(login).toBeInTheDocument()
  })

  it('does not render the feedback link when user is not logged in', async () => {
    setup({ hasLoggedInUser: false })

    render(<DesktopMenu />, {
      wrapper: wrapper({
        initialEntries: '/gh/',
        path: '/:provider/',
      }),
    })

    await waitFor(() => queryClient.isFetching)
    await waitFor(() => !queryClient.isFetching)

    const feedbackLink = screen.queryByText('feedback')
    expect(feedbackLink).toBeNull()
  })

  it('renders the feedback link when user is logged in', async () => {
    setup()

    render(<DesktopMenu />, {
      wrapper: wrapper({
        initialEntries: '/gh/',
        path: '/:provider/',
      }),
    })

    const feedback = await screen.findByText('Feedback')
    expect(feedback).toBeInTheDocument()
    expect(feedback).toHaveAttribute('href', '/gh/feedback')
  })

  describe('when running in self hosted mode', () => {
    it('renders the seat count when user is logged in', async () => {
      config.IS_SELF_HOSTED = true
      setup()

      render(<DesktopMenu />, {
        wrapper: wrapper({
          initialEntries: '/gh/',
          path: '/:provider/',
        }),
      })

      const seatCount = await screen.findByText(/available seats/)
      expect(seatCount).toBeInTheDocument()
    })

    it('renders the admin link when user is logged in', async () => {
      config.IS_SELF_HOSTED = true
      setup()

      render(<DesktopMenu />, {
        wrapper: wrapper({
          initialEntries: '/gh/',
          path: '/:provider/',
        }),
      })

      const adminLink = await screen.findByText(/Admin/)
      expect(adminLink).toBeInTheDocument()
    })
  })
})

describe('LoginPrompt', () => {
  describe('with a provider available', () => {
    it('renders a login button and a sign up button', () => {
      render(<LoginPrompt />, { wrapper: wrapper() })

      const loginPrompt = screen.getByTestId('login-prompt')

      const loginLink = within(loginPrompt).getByText('Log in')
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute(
        'href',
        'https://stage-web.codecov.dev/login/gh?to=http%3A%2F%2Flocalhost%2F'
      )

      const signUpLink = within(loginPrompt).getByText('Sign up')
      expect(signUpLink).toBeInTheDocument()
      expect(signUpLink).toHaveAttribute(
        'href',
        'https://about.codecov.io/sign-up/'
      )
    })

    it('renders link to marketing if url starts with /login', () => {
      render(<LoginPrompt />, {
        wrapper: wrapper({
          initialEntries: '/login/gh',
          path: '/login/:provider',
        }),
      })

      const newToCodecov = screen.getByText(/new to codecov\?/i)
      expect(newToCodecov).toBeInTheDocument()

      const learnMore = screen.getByRole('link', {
        name: /learn more/i,
      })
      expect(learnMore).toBeInTheDocument()
    })
  })

  describe('without a provider', () => {
    it('does not render a login button and a sign up button', () => {
      render(<LoginPrompt />, {
        wrapper: wrapper({
          initialEntries: '/login',
          path: '/login',
        }),
      })

      const loginPrompt = screen.queryByTestId('login-prompt')
      expect(loginPrompt).not.toBeInTheDocument()
    })

    it('does not render a link to marketing if url starts with /login', () => {
      render(<LoginPrompt />, {
        wrapper: wrapper({
          initialEntries: '/login',
          path: '/login',
        }),
      })

      const newToCodecov = screen.queryByText(/new to codecov\?/i)
      expect(newToCodecov).not.toBeInTheDocument()

      const learnMoreLink = screen.queryByRole('link', {
        name: /learn more/i,
      })
      expect(learnMoreLink).not.toBeInTheDocument()
    })
  })
})
