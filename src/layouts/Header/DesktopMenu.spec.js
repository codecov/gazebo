import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch, useParams } from 'react-router-dom'

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

describe('DesktopMenu', () => {
  function setup({ provider }) {
    render(
      <MemoryRouter initialEntries={[`/${provider}`]}>
        <Switch>
          <Route path="/:provider" exact>
            <DesktopMenu />
          </Route>
        </Switch>
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
      const a = screen.getByText(expectedLink.label).closest('a')
      expect(a).toHaveAttribute('href', expectedLink.to)
    })
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
      const a = screen.getByText(expectedLink.label).closest('a')
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
