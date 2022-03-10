import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch, useParams } from 'react-router-dom'

import Dropdown from './Dropdown'

const currentUser = {
  user: {
    username: 'p',
    avatarUrl: 'f',
  },
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))

describe('Dropdown', () => {
  let links
  const userAppManagePage = 'Manage GitHub org access'
  function setup({ provider }) {
    links = [
      {
        label: 'Settings',
        to: `/account/${provider}/${currentUser.user.username}`,
      },
      { label: 'Organizations', to: `/${provider}` },
      {
        label: 'Sign Out',
        to: `https://stage-web.codecov.dev/logout/${provider}`,
      },
    ]

    useParams.mockReturnValue({ provider })
    render(
      <MemoryRouter initialEntries={[`/${provider}`]}>
        <Switch>
          <Route path="/:provider" exact>
            <Dropdown currentUser={currentUser} />
          </Route>
        </Switch>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    it('renders the users avatar', () => {
      setup({ provider: 'gh' })

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'avatar')
    })

    it('the links arent visible', () => {
      setup({ provider: 'gh' })

      links.forEach((link) => {
        const a = screen.getByText(link.label)
        expect(a).not.toBeVisible()
      })
      const a = screen.getByText(userAppManagePage).closest('a')
      expect(a).not.toBeVisible()
    })
  })

  describe('when the avatar is clicked', () => {
    it('the links become visible', () => {
      setup({ provider: 'gh' })

      fireEvent.mouseDown(screen.getByRole('button'))
      links.forEach((link) => {
        const a = screen.getByText(link.label).closest('a')
        expect(a).toBeVisible()
        expect(a).toHaveAttribute('href', link.to)
      })
      const a = screen.getByText(userAppManagePage).closest('a')
      expect(a).toBeVisible()
    })
  })

  describe('when rendered with a provider that is not github', () => {
    it('renders the users avatar', () => {
      setup({ provider: 'gl' })

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'avatar')
    })

    it('does not render manage giithub org access', () => {
      setup({ provider: 'gl' })

      fireEvent.mouseDown(screen.getByRole('button'))
      links.forEach((link) => {
        const a = screen.getByText(link.label).closest('a')
        expect(a).toBeVisible()
      })
      const a = screen.queryByText(userAppManagePage)
      expect(a).not.toBeInTheDocument()
    })
  })
})
