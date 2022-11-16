import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch, useParams } from 'react-router-dom'

import { useImage } from 'services/image'

import Dropdown from './Dropdown'

const currentUser = {
  user: {
    username: 'p',
    avatarUrl: 'f',
  },
}

jest.mock('services/image')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))

describe('Dropdown', () => {
  let links
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

    useImage.mockReturnValue({ src: 'imageUrl', isLoading: false, error: null })
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

    describe('the links are not visible', () => {
      beforeEach(() => setup({ provider: 'gh' }))

      it('does not show settings link', () => {
        const link = screen.getByText('Settings')
        expect(link).not.toBeVisible()
      })

      it('does not show organizations link', () => {
        const link = screen.getByText('Organizations')
        expect(link).not.toBeVisible()
      })

      it('does not sign out link', () => {
        const link = screen.getByText('Sign Out')
        expect(link).not.toBeVisible()
      })

      it('does not show manage app access link', () => {
        const link = screen.getByText('Manage GitHub org access')
        expect(link).not.toBeVisible()
      })
    })
  })

  describe('when the avatar is clicked', () => {
    describe('the links become visible', () => {
      beforeEach(() => setup({ provider: 'gh' }))

      it('shows settings link', () => {
        const link = screen.getByText('Settings')

        expect(link).not.toBeVisible()

        userEvent.click(screen.getByRole('button'))

        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href', links[0].to)
      })

      it('shows organizations link', () => {
        const link = screen.getByText('Organizations')

        expect(link).not.toBeVisible()

        userEvent.click(screen.getByRole('button'))

        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href', links[1].to)
      })

      it('shows sign out link', () => {
        const link = screen.getByText('Sign Out')

        expect(link).not.toBeVisible()

        userEvent.click(screen.getByRole('button'))

        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href', links[2].to)
      })

      it('shows manage app access link', () => {
        const link = screen.getByText('Manage GitHub org access')

        expect(link).not.toBeVisible()

        userEvent.click(screen.getByRole('button'))

        expect(link).toBeVisible()
      })
    })
  })

  describe('when rendered with a provider that is not github', () => {
    beforeEach(() => setup({ provider: 'gl' }))

    it('renders the users avatar', () => {
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'avatar')
    })

    it('shows settings link', () => {
      const link = screen.getByText('Settings')

      expect(link).not.toBeVisible()

      userEvent.click(screen.getByRole('button'))

      expect(link).toBeVisible()
      expect(link).toHaveAttribute('href', links[0].to)
    })

    it('shows organizations link', () => {
      const link = screen.getByText('Organizations')

      expect(link).not.toBeVisible()

      userEvent.click(screen.getByRole('button'))

      expect(link).toBeVisible()
      expect(link).toHaveAttribute('href', links[1].to)
    })

    it('shows sign out link', () => {
      const link = screen.getByText('Sign Out')

      expect(link).not.toBeVisible()

      userEvent.click(screen.getByRole('button'))

      expect(link).toBeVisible()
      expect(link).toHaveAttribute('href', links[2].to)
    })

    it('does not show manage app access link', () => {
      const link = screen.queryByText('Manage GitHub org access')
      expect(link).toBeNull()
    })
  })
})
