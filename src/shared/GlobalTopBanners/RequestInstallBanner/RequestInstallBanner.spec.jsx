import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import config from 'config'

import { useLocationParams } from 'services/navigation'

import RequestInstallBanner from './RequestInstallBanner'

jest.mock('services/navigation')
jest.mock('config')
jest.mock('shared/featureFlags')

const wrapper =
  ({ provider = 'gh' }) =>
  ({ children }) => {
    return (
      <MemoryRouter initialEntries={[`/${provider}/codecov`]}>
        <Switch>
          <Route path="/:provider/:owner">{children}</Route>
        </Switch>
      </MemoryRouter>
    )
  }

describe('RequestInstallBanner', () => {
  function setup(
    { setUpAction, isSelfHosted } = {
      setUpAction: 'request',
      isSelfHosted: false,
    }
  ) {
    const user = userEvent.setup()
    const mockSetItem = jest.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = jest.spyOn(window.localStorage.__proto__, 'getItem')

    config.IS_SELF_HOSTED = isSelfHosted

    useLocationParams.mockReturnValue({
      params: { setup_action: setUpAction },
    })

    return {
      user,
      mockSetItem,
      mockGetItem,
    }
  }

  describe('when rendered with github provider', () => {
    it('renders banner body', () => {
      setup()

      render(<RequestInstallBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const body = screen.getByText(/Installation request sent./)
      expect(body).toBeInTheDocument()

      const body2 = screen.getByText(
        /You need GitHub Admin approval to install the app. We bugged them for you. You should too./
      )
      expect(body2).toBeInTheDocument()
    })
  })

  describe('when rendered with a different setup action', () => {
    it('renders empty dom', () => {
      setup({ setUpAction: 'install' })

      const { container } = render(<RequestInstallBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when rendered with other providers', () => {
    it('does not render banner body', () => {
      setup()

      render(<RequestInstallBanner />, {
        wrapper: wrapper({ provider: 'gl' }),
      })

      const body = screen.queryByText(/Installation request sent./)
      expect(body).not.toBeInTheDocument()
    })
  })

  describe('user dismisses banner', () => {
    it('renders dismiss button', async () => {
      setup()

      render(<RequestInstallBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const dismissButton = await screen.findByRole('button', {
        name: 'x.svg',
      })
      expect(dismissButton).toBeInTheDocument()
    })

    it('calls local storage', async () => {
      const { user, mockGetItem, mockSetItem } = setup()

      mockGetItem.mockReturnValue(null)

      render(<RequestInstallBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const dismissButton = await screen.findByRole('button', {
        name: 'x.svg',
      })
      expect(dismissButton).toBeInTheDocument()
      await user.click(dismissButton)

      await waitFor(() =>
        expect(mockSetItem).toBeCalledWith(
          'dismissed-top-banners',
          JSON.stringify({ 'request-install-banner': 'true' })
        )
      )
    })

    it('hides the banner', async () => {
      const { user, mockGetItem } = setup()

      mockGetItem.mockReturnValue(null)

      const { container } = render(<RequestInstallBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const dismissButton = await screen.findByRole('button', {
        name: 'x.svg',
      })
      expect(dismissButton).toBeInTheDocument()
      await user.click(dismissButton)

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })

  describe('when self hosted', () => {
    it('does not render banner body', () => {
      setup({ isSelfHosted: true })

      render(<RequestInstallBanner />, {
        wrapper: wrapper({ provider: 'gh' }),
      })

      const body = screen.queryByText(/Installation request sent./)
      expect(body).not.toBeInTheDocument()
    })
  })

  describe('when there is no valid provider', () => {
    it('does not render banner body', () => {
      setup()

      render(<RequestInstallBanner />, {
        wrapper: wrapper({ provider: null }),
      })

      const body = screen.queryByText(/Installation request sent./)
      expect(body).not.toBeInTheDocument()
    })
  })
})
