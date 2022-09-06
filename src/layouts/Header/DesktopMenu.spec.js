import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { useUser } from 'services/user'

import DesktopMenu, { LoginPrompt } from './DesktopMenu'

jest.mock('services/user')
jest.mock('services/account')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))
jest.mock('./RequestButton', () => () => 'Request Button')

const loggedInUser = {
  user: {
    username: 'p',
    avatarUrl: '',
  },
}

const accountDetails = {
  plan: {
    value: 'users-free',
  },
}

const mockSeatData = {
  config: {
    seatsUsed: 5,
    seatsLimit: 10,
  },
}

const queryClient = new QueryClient()
const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('DesktopMenu', () => {
  function setup({ provider }) {
    server.use(
      server.use(
        graphql.query('Seats', (req, res, ctx) =>
          res(ctx.status(200), ctx.data(mockSeatData))
        )
      )
    )

    render(
      <MemoryRouter initialEntries={[`/${provider}`]}>
        <Route path="/:provider" exact>
          <QueryClientProvider client={queryClient}>
            <DesktopMenu />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  it('renders static links', () => {
    const provider = 'gh'

    useUser.mockReturnValue({ data: loggedInUser })
    useParams.mockReturnValue({ owner: 'fjord', provider: provider })
    useAccountDetails.mockReturnValue({ data: accountDetails })
    setup({ provider })

    const expectedStaticLinks = [
      { label: 'Docs', to: 'https://docs.codecov.io/' },
      { label: 'Support', to: 'https://codecov.freshdesk.com/support/home' },
      { label: 'Blog', to: 'https://about.codecov.io/blog' },
    ]

    expectedStaticLinks.forEach((expectedLink) => {
      const a = within(screen.getByTestId('desktop-menu')).getByText(
        expectedLink.label
      )
      expect(a).toHaveAttribute('href', expectedLink.to)
    })
  })

  it('renders the seat count when user is logged in', () => {
    const provider = 'gh'
    useUser.mockReturnValue({ data: loggedInUser })
    useParams.mockReturnValue({ owner: 'fjord', provider: provider })
    useAccountDetails.mockReturnValue({ data: accountDetails })
    setup({ provider })

    const seatCount = screen.getByText(/available seats/)
    expect(seatCount).toBeInTheDocument()
  })

  it('renders the dropdown when user is logged in', () => {
    const provider = 'gh'
    useUser.mockReturnValue({ data: loggedInUser })
    useParams.mockReturnValue({ owner: 'fjord', provider: provider })
    useAccountDetails.mockReturnValue({ data: accountDetails })
    setup({ provider })

    const dropdown = screen.getByTestId('dropdown')
    expect(dropdown).toBeInTheDocument()
  })

  it('renders request demo button when there is owner with free plan is logged in', () => {
    const provider = 'gh'
    useUser.mockReturnValue({ data: loggedInUser })
    useParams.mockReturnValue({ owner: 'fjord', provider: provider })
    useAccountDetails.mockReturnValue({ data: accountDetails })
    setup({ provider })

    const requestDemoButton = screen.getByText('Request Button')
    expect(requestDemoButton).toBeInTheDocument()
  })

  it('does not render request demo button when owner is undefined', () => {
    const provider = 'gh'
    useUser.mockReturnValue({ data: loggedInUser })
    useParams.mockReturnValue({ owner: undefined, provider: provider })
    useAccountDetails.mockReturnValue({ data: accountDetails })
    setup({ provider })
    expect(screen.queryByText(/Request demo/)).toBeNull()
  })

  it('renders the login prompt when user not logged in', () => {
    const provider = 'gh'
    useUser.mockReturnValue({ data: null })
    useParams.mockReturnValue({ owner: undefined, provider: provider })
    setup({ provider })
    const login = screen.getByTestId('login-prompt')
    expect(login).toBeInTheDocument()
  })

  it('does not render the feedback link when user is not logged in', () => {
    const provider = 'gh'
    useUser.mockReturnValue({ data: undefined })
    useParams.mockReturnValue({ owner: undefined, provider: provider })
    setup({ provider })

    expect(screen.queryByText('feedback')).toBeNull()
  })

  it('renders the feedback link when user is logged in', () => {
    const provider = 'gh'
    useUser.mockReturnValue({ data: loggedInUser })
    useParams.mockReturnValue({ owner: undefined, provider: provider })
    useAccountDetails.mockReturnValue({ data: accountDetails })
    setup({ provider })

    const feedback = screen.getByText('Feedback')
    expect(feedback).toBeInTheDocument()
  })
})

describe('LoginPrompt', () => {
  it('renders a login button and a sign up button', () => {
    useParams.mockReturnValue({ provider: '' })
    render(<LoginPrompt />, { wrapper: MemoryRouter })

    const expectedLinks = [
      {
        label: 'Log in',
        to: 'https://stage-web.codecov.dev/login/?to=http%3A%2F%2Flocalhost%2F',
      },
      { label: 'Sign up', to: 'https://about.codecov.io/sign-up/' },
    ]

    expectedLinks.forEach((expectedLink) => {
      const a = within(screen.getByTestId('login-prompt')).getByText(
        expectedLink.label
      )
      expect(a).toHaveAttribute('href', expectedLink.to)
    })
  })

  it('renders link to marketing if url starts with /login', () => {
    useParams.mockReturnValue({ provider: '' })
    render(
      <MemoryRouter initialEntries={['/login']}>
        <LoginPrompt />
      </MemoryRouter>
    )
    expect(screen.getByText(/new to codecov\?/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: /learn more/i,
      })
    ).toBeInTheDocument()
  })
})
