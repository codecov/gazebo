import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUser } from 'services/user'

import GithubPrivateScopeLogin from './GithubPrivateScopeLogin'

jest.mock('services/user')

const user = {
  privateAccess: false,
}

describe('GithubPrivateScopeLogin', () => {
  describe('should not render', () => {
    it('if no user exists', () => {
      useUser.mockReturnValue({ data: undefined })
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <GithubPrivateScopeLogin />
          </Route>
        </MemoryRouter>
      )

      expect(screen.queryByText('add private')).not.toBeInTheDocument()
    })

    it('if the user has a service other than github', () => {
      useUser.mockReturnValue({
        data: user,
      })
      render(
        <MemoryRouter initialEntries={['/bb']}>
          <Route path="/:provider">
            <GithubPrivateScopeLogin />
          </Route>
        </MemoryRouter>
      )

      expect(screen.queryByText('add private')).not.toBeInTheDocument()
    })

    it('if the user already has private access', () => {
      useUser.mockReturnValue({
        data: {
          ...user,
          privateAccess: true,
        },
      })
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <GithubPrivateScopeLogin />
          </Route>
        </MemoryRouter>
      )

      expect(screen.queryByText('add private')).not.toBeInTheDocument()
    })
  })

  it('renders', () => {
    useUser.mockReturnValue({ data: user })
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <GithubPrivateScopeLogin />
        </Route>
      </MemoryRouter>
    )

    expect(screen.queryByText('add private')).toHaveAttribute(
      'href',
      'https://stage-web.codecov.dev/login/gh?private=t'
    )
  })
})
