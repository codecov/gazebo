import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useUser } from 'services/user'
import { useAccountDetails } from 'services/account'
import { useParams } from 'react-router-dom'

import DesktopMenu from './DesktopMenu'
import { LoginPrompt } from './DesktopMenu'

jest.mock('services/user')
jest.mock('services/account')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(),
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

describe('DesktopMenu', () => {
  function setup() {
    render(<DesktopMenu />, { wrapper: MemoryRouter })
  }

  it('renders static links', () => {
    useUser.mockReturnValue({ data: loggedInUser })
    useParams.mockReturnValue({ owner: 'fjord', provider: 'gh' })
    useAccountDetails.mockReturnValue({ data: accountDetails })
    setup()

    const expectedStaticLinks = [
      { label: 'Docs', to: 'https://docs.codecov.io/' },
      { label: 'Support', to: 'https://codecov.freshdesk.com/support/home' },
      { label: 'Blog', to: 'https://about.codecov.io/blog' },
    ]

    expectedStaticLinks.forEach((expectedLink) => {
      const a = screen.getByText(expectedLink.label).closest('a')
      expect(a).toHaveAttribute('href', expectedLink.to)
    })
  })

  it('renders the dropdown when user is logged in', () => {
    useUser.mockReturnValue({ data: loggedInUser })
    useParams.mockReturnValue({ owner: 'fjord', provider: 'gh' })
    useAccountDetails.mockReturnValue({ data: accountDetails })
    setup()

    const dropdown = screen.getByTestId('dropdown')
    expect(dropdown).toBeInTheDocument()
  })

  it('renders request demo button when there is owner with free plan is logged in', () => {
    useUser.mockReturnValue({ data: loggedInUser })
    useParams.mockReturnValue({ owner: 'fjord', provider: 'gh' })
    useAccountDetails.mockReturnValue({ data: accountDetails })
    setup()

    const requestDemoButton = screen.getByText('Request Button')
    expect(requestDemoButton).toBeInTheDocument()
  })

  it('does not render request demo button when owner is undefined', () => {
    useUser.mockReturnValue({ data: loggedInUser })
    useParams.mockReturnValue({ owner: undefined, provider: 'gh' })
    useAccountDetails.mockReturnValue({ data: accountDetails })
    setup()
    expect(screen.queryByText(/Request demo/)).toBeNull()
  })

  it('renders the login prompt when user not logged in', () => {
    useUser.mockReturnValue({ data: null })
    useParams.mockReturnValue({ owner: undefined, provider: 'gh' })
    setup()
    const login = screen.getByTestId('login-prompt')
    expect(login).toBeInTheDocument()
  })
})

describe('LoginPrompt', () => {
  it('renders a login button and a sign up button', () => {
    render(<LoginPrompt />, { wrapper: MemoryRouter })

    const expectedLinks = [
      {
        label: 'Log in',
        to: 'https://stage-web.codecov.dev/login/undefined?to=http%3A%2F%2Flocalhost%2F',
      },
      { label: 'Sign up', to: 'https://about.codecov.io/sign-up' },
    ]

    expectedLinks.forEach((expectedLink) => {
      const a = screen.getByText(expectedLink.label).closest('a')
      expect(a).toHaveAttribute('href', expectedLink.to)
    })
  })

  it('renders link to marketing if url starts with /login', () => {
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
