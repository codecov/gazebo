import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useUser } from 'services/user'

import DesktopMenu from './DesktopMenu'
import { LoginPrompt } from './DesktopMenu'

jest.mock('services/user')

const loggedInUser = {
  user: {
    username: 'p',
    avatarUrl: '',
  },
}

describe('DesktopMenu', () => {
  function setup() {
    render(<DesktopMenu />, { wrapper: MemoryRouter })
  }

  it('renders static links', () => {
    useUser.mockReturnValue({ data: loggedInUser })
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
    setup()

    const dropdown = screen.getByTestId('dropdown')
    expect(dropdown).toBeInTheDocument()
  })

  it('renders the login prompt when user not logged in', () => {
    useUser.mockReturnValue({ data: null })
    setup()
    const login = screen.getByTestId('login-prompt')
    expect(login).toBeInTheDocument()
  })
})

describe('LoginPrompt', () => {
  it('renders a login button and a sign up button', () => {
    render(<LoginPrompt />, { wrapper: MemoryRouter })

    const expectedLinks = [
      { label: 'Log in', to: 'https://stage-web.codecov.dev/login/undefined' },
      { label: 'Sign up', to: 'https://about.codecov.io/sign-up' },
    ]

    expectedLinks.forEach((expectedLink) => {
      const a = screen.getByText(expectedLink.label).closest('a')
      expect(a).toHaveAttribute('href', expectedLink.to)
    })
  })
})
