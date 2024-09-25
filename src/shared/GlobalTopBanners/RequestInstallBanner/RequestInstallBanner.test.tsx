import * as Sentry from '@sentry/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import RequestInstallBanner from './RequestInstallBanner'

vi.mock('config')

const mocks = vi.hoisted(() => ({
  useLocationParams: vi.fn(),
  useFlags: vi.fn(),
  captureMessage: vi.fn(),
}))

vi.mock('services/navigation', async () => {
  const originalModule = await vi.importActual('services/navigation')
  return {
    ...originalModule,
    useLocationParams: mocks.useLocationParams,
  }
})
vi.mock('shared/featureFlags', async () => {
  const originalModule = await vi.importActual('shared/featureFlags')
  return {
    ...originalModule,
    useFlags: mocks.useFlags,
  }
})
vi.mock('@sentry/react', async () => {
  const originalModule = await vi.importActual('@sentry/react')
  return {
    ...originalModule,
    metrics: {
      // @ts-expect-error
      ...originalModule.metrics,
      increment: mocks.captureMessage,
    },
  }
})

console.error = () => {}

const wrapper =
  (initialEntries = ''): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <MemoryRouter initialEntries={[initialEntries]}>
      <Route path="/:provider/:owner">{children}</Route>
    </MemoryRouter>
  )

type SetupArgs = {
  setUpAction?: string
  isSelfHosted?: boolean
}

describe('RequestInstallBanner', () => {
  afterAll(() => {
    vi.restoreAllMocks()
  })

  function setup({ setUpAction = 'request', isSelfHosted = false }: SetupArgs) {
    const user = userEvent.setup()
    const mockSetItem = vi.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = vi.spyOn(window.localStorage.__proto__, 'getItem')

    config.IS_SELF_HOSTED = isSelfHosted

    mocks.useLocationParams.mockReturnValue({
      params: { setup_action: setUpAction },
    })

    return {
      user,
      mockSetItem,
      mockGetItem,
    }
  }

  describe('rendering banner', () => {
    it('renders left side text', () => {
      setup({})
      render(<RequestInstallBanner />, { wrapper: wrapper('/gh/codecov') })

      const leftText = screen.getByText(
        "Since you're a member of the requested organization," +
          ' you need the owner to approve and install the app.'
      )
      expect(leftText).toBeInTheDocument()
    })

    describe('rendering share request button', () => {
      it('renders button', () => {
        setup({})
        render(<RequestInstallBanner />, { wrapper: wrapper('/gh/codecov') })

        const btn = screen.getByRole('button', { name: /Share Request/ })
        expect(btn).toBeInTheDocument()
      })

      describe('user clicks the button', () => {
        it('opens copy modal', async () => {
          const { user, mockGetItem } = setup({})
          render(<RequestInstallBanner />, { wrapper: wrapper('/gh/codecov') })

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

        it('should capture the user shared request metric', async () => {
          const { user, mockGetItem } = setup({})
          render(<RequestInstallBanner />, { wrapper: wrapper('/gh/codecov') })

          mockGetItem.mockReturnValue(null)

          const btn = screen.getByRole('button', { name: /Share Request/ })
          expect(btn).toBeInTheDocument()
          await user.click(btn)

          expect(Sentry.metrics.increment).toHaveBeenCalledWith(
            'request_install.user.shared.request',
            undefined,
            undefined
          )
        })
      })

      describe('user closes modal without clicking Done', () => {
        it('closes the modal', async () => {
          const { user, mockGetItem } = setup({})
          render(<RequestInstallBanner />, { wrapper: wrapper('/gh/codecov') })

          mockGetItem.mockReturnValue(null)

          const shareBtn = screen.getByRole('button', { name: /Share Request/ })
          expect(shareBtn).toBeInTheDocument()
          await user.click(shareBtn)

          const modalText = screen.getByText(
            "Copy the link below and share it with your organization's" +
              ' admin or owner to assist.'
          )
          expect(modalText).toBeInTheDocument()

          const modalCloseBtn = await screen.findByTestId('modal-close-icon')
          expect(modalCloseBtn).toBeInTheDocument()
          await user.click(modalCloseBtn)
          expect(modalText).not.toBeInTheDocument()
        })
      })

      describe('user clicks done on the modal', () => {
        it('calls local storage', async () => {
          const { user, mockGetItem, mockSetItem } = setup({})
          render(<RequestInstallBanner />, { wrapper: wrapper('/gh/codecov') })

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
              JSON.stringify({ 'request-install-banner': 'true' })
            )
          )
        })
      })
    })
  })

  describe('user dismisses banner', () => {
    it('calls local storage', async () => {
      const { user, mockGetItem, mockSetItem } = setup({})
      render(<RequestInstallBanner />, { wrapper: wrapper('/gh/codecov') })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = screen.getByTestId('dismiss-request-install-banner')
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() =>
        expect(mockSetItem).toHaveBeenCalledWith(
          'dismissed-top-banners',
          JSON.stringify({ 'request-install-banner': 'true' })
        )
      )
    })

    it('hides the banner', async () => {
      const { user, mockGetItem } = setup({})
      const { container } = render(<RequestInstallBanner />, {
        wrapper: wrapper('/gh/codecov'),
      })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = screen.getByTestId('dismiss-request-install-banner')
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })

  describe('when rendered with a different setup action', () => {
    it('renders empty dom', () => {
      setup({ setUpAction: 'install' })

      const { container } = render(<RequestInstallBanner />, {
        wrapper: wrapper('/gh/codecov'),
      })
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when rendered with other providers', () => {
    it('does not render banner body', () => {
      setup({})

      render(<RequestInstallBanner />, {
        wrapper: wrapper('/gl/owner'),
      })

      const body = screen.queryByText(/Copy the link below/)
      expect(body).not.toBeInTheDocument()
    })
  })

  describe('when self hosted', () => {
    it('does not render banner body', () => {
      setup({ isSelfHosted: true })

      render(<RequestInstallBanner />, { wrapper: wrapper() })

      const body = screen.queryByText(/Installation request sent./)
      expect(body).not.toBeInTheDocument()
    })
  })

  describe('when there is no valid provider', () => {
    it('does not render banner body', () => {
      setup({})

      render(<RequestInstallBanner />, { wrapper: wrapper() })

      const body = screen.queryByText(/Installation request sent./)
      expect(body).not.toBeInTheDocument()
    })
  })
})
