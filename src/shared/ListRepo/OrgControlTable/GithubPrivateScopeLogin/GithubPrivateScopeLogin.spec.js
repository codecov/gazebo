import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useUser } from 'services/user'

import GithubPrivateScopeLogin from './GithubPrivateScopeLogin'

jest.mock('services/user')

const user = {
  privateAccess: false,
  service: 'github',
}

describe('GithubPrivateScopeLogin', () => {
  describe('should not render', () => {
    it('if no user exists', () => {
      useUser.mockReturnValue({ data: undefined })
      render(<GithubPrivateScopeLogin />, { wrapper: MemoryRouter })

      expect(screen.queryByText('add private')).not.toBeInTheDocument()
    })

    it('if the user has a service other than github', () => {
      useUser.mockReturnValue({
        data: {
          ...user,
          service: 'bitbucket',
        },
      })
      render(<GithubPrivateScopeLogin />, { wrapper: MemoryRouter })

      expect(screen.queryByText('add private')).not.toBeInTheDocument()
    })

    it('if the user already has private access', () => {
      useUser.mockReturnValue({
        data: {
          ...user,
          privateAccess: true,
        },
      })
      render(<GithubPrivateScopeLogin />, { wrapper: MemoryRouter })

      expect(screen.queryByText('add private')).not.toBeInTheDocument()
    })
  })

  it('renders', () => {
    useUser.mockReturnValue({ data: user })
    render(<GithubPrivateScopeLogin />, { wrapper: MemoryRouter })

    expect(screen.queryByText('add private')).toHaveAttribute(
      'href',
      'https://stage-web.codecov.dev/login/github?private=t'
    )
  })
})
