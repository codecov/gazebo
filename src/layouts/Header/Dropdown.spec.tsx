import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Cookies from 'js-cookie'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import config, {
  COOKIE_SESSION_EXPIRY,
  LOCAL_STORAGE_SESSION_TRACKING_KEY,
} from 'config'

import { useImage } from 'services/image'

import Dropdown from './Dropdown'

const currentUser = {
  user: {
    username: 'chetney',
    avatarUrl: 'http://127.0.0.1/avatar-url',
  },
}

jest.mock('services/image')
jest.mock('config')

jest.mock('js-cookie')

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Switch>
          <Route path="/:provider" exact>
            {children}
          </Route>
        </Switch>
      </MemoryRouter>
    )

describe('Dropdown', () => {
  function setup({ selfHosted } = { selfHosted: false }) {
    const mockUseImage = useImage as jest.Mock
    mockUseImage.mockReturnValue({
      src: 'imageUrl',
      isLoading: false,
      error: null,
    })
    config.IS_SELF_HOSTED = selfHosted
    const mockRemoveItem = jest.spyOn(
      window.localStorage.__proto__,
      'removeItem'
    )

    return {
      user: userEvent.setup(),
      mockRemoveItem,
    }
  }

  describe('when rendered', () => {
    beforeEach(() => setup())

    it('renders the users avatar', () => {
      render(<Dropdown currentUser={currentUser} />, {
        wrapper: wrapper(),
      })

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'avatar')
    })
  })

  describe('when on GitHub', () => {
    afterEach(() => {
      jest.resetAllMocks()
    })
    describe('when the avatar is clicked', () => {
      it('shows settings link', async () => {
        const { user } = setup()
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: wrapper(),
        })

        expect(screen.queryByText('Settings')).not.toBeInTheDocument()

        const openSelect = screen.getByRole('combobox')
        await user.click(openSelect)

        const link = screen.getByText('Settings')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href', '/account/gh/chetney')
      })

      it('shows sign out link', async () => {
        const { user } = setup()
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: wrapper(),
        })

        expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()

        const openSelect = screen.getByRole('combobox')
        await user.click(openSelect)

        const link = screen.getByText('Sign Out')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href', '/logout/gh')
      })

      it('removes session expiry tracking key and session_expiry cookie on sign out', async () => {
        const { user, mockRemoveItem } = setup()

        jest.spyOn(console, 'error').mockImplementation()
        const removeSpy = jest.spyOn(Cookies, 'remove').mockReturnValue()
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: wrapper(),
        })

        const openSelect = screen.getByRole('combobox')
        await user.click(openSelect)

        const link = screen.getByText('Sign Out')
        expect(link).toBeVisible()
        await user.click(link)

        expect(mockRemoveItem).toHaveBeenCalledWith(
          LOCAL_STORAGE_SESSION_TRACKING_KEY
        )
        expect(removeSpy).toHaveBeenCalledWith(COOKIE_SESSION_EXPIRY)
      })

      it('shows manage app access link', async () => {
        const { user } = setup()
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: wrapper(),
        })

        expect(
          screen.queryByText('Install Codecov app')
        ).not.toBeInTheDocument()

        const openSelect = screen.getByRole('combobox')
        await user.click(openSelect)

        const link = screen.getByText('Install Codecov app')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute(
          'href',
          'https://github.com/apps/codecov/installations/new'
        )
      })
    })
  })
  describe('when not on GitHub', () => {
    describe('when the avatar is clicked', () => {
      it('shows settings link', async () => {
        const { user } = setup()
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: wrapper('/gl'),
        })

        expect(screen.queryByText('Settings')).not.toBeInTheDocument()

        const openSelect = screen.getByRole('combobox')
        await user.click(openSelect)

        const link = screen.getByText('Settings')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href', '/account/gl/chetney')
      })

      it('shows sign out link', async () => {
        const { user } = setup()
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: wrapper('/gl'),
        })

        expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()

        const openSelect = screen.getByRole('combobox')
        await user.click(openSelect)

        const link = screen.getByText('Sign Out')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href', '/logout/gl')
      })

      it('does not show manage app access link', async () => {
        const { user } = setup()
        render(<Dropdown currentUser={currentUser} />, {
          wrapper: wrapper('/gl'),
        })

        expect(
          screen.queryByText('Install Codecov app')
        ).not.toBeInTheDocument()

        const openSelect = screen.getByRole('combobox')
        await user.click(openSelect)

        expect(
          screen.queryByText('Install Codecov app')
        ).not.toBeInTheDocument()
      })
    })
  })
})
