import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import config from 'config'

import { useImage } from 'services/image'

import Dropdown from './Dropdown'

const currentUser = {
  user: {
    username: 'chetney',
    avatarUrl: 'f',
  },
}

jest.mock('services/image')
jest.mock('config')

const Wrapper =
  ({ provider }) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[`/${provider}`]}>
        <Switch>
          <Route path="/:provider" exact>
            {children}
          </Route>
        </Switch>
      </MemoryRouter>
    )

describe('Dropdown', () => {
  function setup({ selfHosted } = { selfHosted: false }) {
    useImage.mockReturnValue({ src: 'imageUrl', isLoading: false, error: null })
    config.IS_SELF_HOSTED = selfHosted
  }

  describe('when rendered', () => {
    beforeEach(() => setup())

    it('renders the users avatar', () => {
      render(<Dropdown currentUser={currentUser} />, {
        wrapper: Wrapper({ provider: 'gh' }),
      })

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'avatar')
    })
  })

  describe('when on GitHub', () => {
    describe('when the avatar is clicked', () => {
      beforeEach(() => setup())

      it('shows settings link', () => {
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: Wrapper({ provider: 'gh' }),
        })

        expect(screen.queryByText('Settings')).not.toBeInTheDocument()

        userEvent.click(screen.getByRole('button'))

        const link = screen.getByText('Settings')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href', '/account/gh/chetney')
      })

      it('shows organizations link', () => {
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: Wrapper({ provider: 'gh' }),
        })

        expect(screen.queryByText('Organizations')).not.toBeInTheDocument()

        userEvent.click(screen.getByRole('button'))

        const link = screen.getByText('Organizations')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href', '/gh')
      })

      it('shows sign out link', () => {
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: Wrapper({ provider: 'gh' }),
        })

        expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()

        userEvent.click(screen.getByRole('button'))

        const link = screen.getByText('Sign Out')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute(
          'href',
          'https://stage-web.codecov.dev/logout/gh'
        )
      })

      it('shows manage app access link', () => {
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: Wrapper({ provider: 'gh' }),
        })

        expect(
          screen.queryByText('Manage GitHub org access')
        ).not.toBeInTheDocument()

        userEvent.click(screen.getByRole('button'))

        const link = screen.getByText('Manage GitHub org access')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute(
          'href',
          'https://github.com/settings/connections/applications/c68c81cbfd179a50784a'
        )
      })
    })
  })
  describe('when not on GitHub', () => {
    describe('when the avatar is clicked', () => {
      beforeEach(() => setup())

      it('shows settings link', () => {
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: Wrapper({ provider: 'gl' }),
        })

        expect(screen.queryByText('Settings')).not.toBeInTheDocument()

        userEvent.click(screen.getByRole('button'))

        const link = screen.getByText('Settings')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href', '/account/gl/chetney')
      })

      it('shows organizations link', () => {
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: Wrapper({ provider: 'gl' }),
        })

        expect(screen.queryByText('Organizations')).not.toBeInTheDocument()

        userEvent.click(screen.getByRole('button'))

        const link = screen.getByText('Organizations')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href', '/gl')
      })

      it('shows sign out link', () => {
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: Wrapper({ provider: 'gl' }),
        })

        expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()

        userEvent.click(screen.getByRole('button'))

        const link = screen.getByText('Sign Out')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute(
          'href',
          'https://stage-web.codecov.dev/logout/gl'
        )
      })

      it('does not show manage app access link', () => {
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: Wrapper({ provider: 'gl' }),
        })

        expect(
          screen.queryByText('Manage GitHub org access')
        ).not.toBeInTheDocument()

        userEvent.click(screen.getByRole('button'))

        expect(
          screen.queryByText('Manage GitHub org access')
        ).not.toBeInTheDocument()
      })
    })
  })
})
