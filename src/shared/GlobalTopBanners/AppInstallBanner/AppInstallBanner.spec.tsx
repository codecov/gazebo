import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import AppInstallBanner from './AppInstallBanner'

console.error = () => {}

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('AppInstallBanner', () => {
  afterEach(() => jest.resetAllMocks())
  function setup() {
    const user = userEvent.setup()
    const mockSetItem = jest.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = jest.spyOn(window.localStorage.__proto__, 'getItem')

    return { user, mockGetItem, mockSetItem }
  }

  describe('rendering banner', () => {
    it('renders left side text', () => {
      render(<AppInstallBanner />, { wrapper })

      const leftText = screen.getByText(
        "Since you're a member of the requested organization," +
          ' you need the owner to approve and install the app.'
      )
      expect(leftText).toBeInTheDocument()
    })

    describe('rendering share request button', () => {
      it('renders button', () => {
        render(<AppInstallBanner />, { wrapper })

        const btn = screen.getByRole('button', { name: /Share Request/ })
        expect(btn).toBeInTheDocument()
      })

      describe('user clicks the button', () => {
        it('opens copy modal', async () => {
          const { user, mockGetItem } = setup()
          render(<AppInstallBanner />, { wrapper })

          mockGetItem.mockReturnValue(null)

          const btn = screen.getByRole('button', { name: /Share Request/ })
          expect(btn).toBeInTheDocument()
          await user.click(btn)

          const modalText = screen.getByText(
            "Copy the link below and share it with your organization's" +
              ' admin or owner to assist.'
          )
          expect(modalText).toBeInTheDocument()
        })
      })

      describe('user clicks done on the modal', () => {
        it('calls local storage', async () => {
          const { user, mockGetItem, mockSetItem } = setup()
          render(<AppInstallBanner />, { wrapper })

          mockGetItem.mockReturnValue(null)

          const shareBtn = screen.getByRole('button', { name: /Share Request/ })
          expect(shareBtn).toBeInTheDocument()
          await user.click(shareBtn)

          const doneBtn = screen.getByRole('button', { name: /Done/ })

          expect(doneBtn).toBeInTheDocument()
          await user.click(doneBtn)

          await waitFor(() =>
            expect(mockSetItem).toHaveBeenCalledWith(
              'dismissed-top-banners',
              JSON.stringify({ 'global-top-app-install-banner': 'true' })
            )
          )
        })
      })
    })

    it('renders dismiss button', () => {
      render(<AppInstallBanner />, { wrapper })

      const dismissBtn = screen.getByRole('button', { name: /x.svg/ })
      expect(dismissBtn).toBeInTheDocument()
    })
  })

  describe('user dismisses banner', () => {
    it('calls local storage', async () => {
      const { user, mockGetItem, mockSetItem } = setup()
      render(<AppInstallBanner />, { wrapper })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = screen.getByRole('button', { name: /x.svg/ })
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() =>
        expect(mockSetItem).toHaveBeenCalledWith(
          'dismissed-top-banners',
          JSON.stringify({ 'global-top-app-install-banner': 'true' })
        )
      )
    })

    it('hides the banner', async () => {
      const { user, mockGetItem } = setup()
      const { container } = render(<AppInstallBanner />, { wrapper })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = screen.getByRole('button', { name: /x.svg/ })
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })
})
