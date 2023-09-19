import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import ExpiredBanner from './ExpiredBanner'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('ExpiredBanner', () => {
  function setup() {
    const user = userEvent.setup()
    const mockSetItem = jest.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = jest.spyOn(window.localStorage.__proto__, 'getItem')

    return { user, mockGetItem, mockSetItem }
  }

  describe('rendering banner', () => {
    it('renders left side text', () => {
      render(<ExpiredBanner />, { wrapper })

      const leftText = screen.getByText(
        /The organization's 14-day free Codecov Pro trial has ended./
      )
      expect(leftText).toBeInTheDocument()
    })

    it('renders link to add payment method', () => {
      render(<ExpiredBanner />, { wrapper })

      const paymentMethodLink = screen.getByRole('link', {
        name: /Add payment method/,
      })
      expect(paymentMethodLink).toBeInTheDocument()
      expect(paymentMethodLink).toHaveAttribute(
        'href',
        '/plan/gh/codecov/upgrade'
      )
    })

    it('renders button to upgrade', () => {
      render(<ExpiredBanner />, { wrapper })

      const btn = screen.getByRole('link', { name: /Upgrade/ })
      expect(btn).toBeInTheDocument()
      expect(btn).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
    })

    it('renders dismiss button', () => {
      render(<ExpiredBanner />, { wrapper })

      const dismissBtn = screen.getByRole('button', { name: /x.svg/ })
      expect(dismissBtn).toBeInTheDocument()
    })
  })

  describe('user dismisses banner', () => {
    it('calls local storage', async () => {
      const { user, mockGetItem, mockSetItem } = setup()
      render(<ExpiredBanner />, { wrapper })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = screen.getByRole('button', { name: /x.svg/ })
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() =>
        expect(mockSetItem).toBeCalledWith(
          'dismissed-top-banners',
          JSON.stringify({ 'global-top-expired-trial-banner': 'true' })
        )
      )
    })

    it('hides the banner', async () => {
      const { user, mockGetItem } = setup()
      const { container } = render(<ExpiredBanner />, { wrapper })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = screen.getByRole('button', { name: /x.svg/ })
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })
})
