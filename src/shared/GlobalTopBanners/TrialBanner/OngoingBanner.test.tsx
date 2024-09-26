import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import OngoingBanner from './OngoingBanner'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('OngoingBanner', () => {
  function setup() {
    const user = userEvent.setup()
    const mockSetItem = vi.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = vi.spyOn(window.localStorage.__proto__, 'getItem')

    return { user, mockGetItem, mockSetItem }
  }

  describe('rendering banner', () => {
    describe('date diff greater then 1', () => {
      it('renders left side text', () => {
        render(<OngoingBanner dateDiff={3} />, { wrapper })

        const leftText = screen.getByText('Your trial ends in 3 days.')
        expect(leftText).toBeInTheDocument()
      })
    })

    describe('date diff eq to 0', () => {
      it('renders left side text', () => {
        render(<OngoingBanner dateDiff={0} />, { wrapper })

        const leftText = screen.getByText('Your trial ends today.')
        expect(leftText).toBeInTheDocument()
      })
    })

    describe('date diff lt or eq to 1', () => {
      it('renders left side text', () => {
        render(<OngoingBanner dateDiff={1} />, { wrapper })

        const leftText = screen.getByText('Your trial ends in 1 day.')
        expect(leftText).toBeInTheDocument()
      })
    })

    it('renders link to upgrade', () => {
      render(<OngoingBanner dateDiff={3} />, { wrapper })

      const upgradeLink = screen.getByRole('link', {
        name: /Upgrade now/,
      })
      expect(upgradeLink).toBeInTheDocument()
      expect(upgradeLink).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
    })

    it('renders button to upgrade', () => {
      render(<OngoingBanner dateDiff={3} />, { wrapper })

      const btn = screen.getByRole('link', { name: /Upgrade now/ })
      expect(btn).toBeInTheDocument()
      expect(btn).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
    })

    it('renders dismiss button', () => {
      render(<OngoingBanner dateDiff={3} />, { wrapper })

      const dismissBtn = screen.getByTestId(
        'dismiss-global-top-ongoing-trial-banner'
      )
      expect(dismissBtn).toBeInTheDocument()
    })
  })

  describe('user dismisses banner', () => {
    it('calls local storage', async () => {
      const { user, mockGetItem, mockSetItem } = setup()
      render(<OngoingBanner dateDiff={3} />, { wrapper })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = screen.getByTestId(
        'dismiss-global-top-ongoing-trial-banner'
      )
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() =>
        expect(mockSetItem).toHaveBeenCalledWith(
          'dismissed-top-banners',
          JSON.stringify({ 'global-top-ongoing-trial-banner': 'true' })
        )
      )
    })

    it('hides the banner', async () => {
      const { user, mockGetItem } = setup()
      const { container } = render(<OngoingBanner dateDiff={3} />, { wrapper })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = screen.getByTestId(
        'dismiss-global-top-ongoing-trial-banner'
      )
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })
})
