import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import AppInstallModal from './AppInstallModal'

afterEach(() => {
  vi.resetAllMocks()
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, suspense: false },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path={'/:provider'} exact>
        {children}
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('AppInstallModal', () => {
  const onClose = vi.fn()
  const onComplete = vi.fn()

  describe('when isOpen is false', () => {
    it('does not render', async () => {
      render(
        <AppInstallModal
          isOpen={false}
          onClose={onClose}
          onComplete={onComplete}
        />,
        { wrapper }
      )

      const copy = screen.queryByText(/Copy the link below/)
      expect(copy).not.toBeInTheDocument()
    })
  })

  describe('when isOpen is true', () => {
    it('renders', async () => {
      render(
        <AppInstallModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />,
        { wrapper }
      )

      expect(screen.getByText('Install Codecov app')).toBeInTheDocument()
      expect(
        screen.getByText(
          'You need to install Codecov app on your GitHub organization as an admin.'
        )
      ).toBeInTheDocument()

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(
        screen.getByText('Install Codecov app via GitHub')
      ).toBeInTheDocument()
    })

    it('calls onClose when Cancel button is clicked', async () => {
      render(
        <AppInstallModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />,
        { wrapper }
      )

      await userEvent.click(screen.getByText('Cancel'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onComplete when Install button is clicked', async () => {
      render(
        <AppInstallModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />,
        { wrapper }
      )

      await userEvent.click(screen.getByText('Install Codecov app via GitHub'))
      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  describe('when modal is closed', () => {
    it('calls onClose', async () => {
      const user = userEvent.setup()
      render(
        <AppInstallModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />,
        { wrapper }
      )

      const closeButton = await screen.findByTestId('modal-close-icon')
      expect(closeButton).toBeInTheDocument()

      expect(onClose).not.toHaveBeenCalled()

      await user.click(closeButton)

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('when modal is "cancelled"', () => {
    it('calls onClose', async () => {
      const user = userEvent.setup()
      render(
        <AppInstallModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />,
        { wrapper }
      )

      const installButton = await screen.findByTestId('close-modal')
      expect(installButton).toBeInTheDocument()

      expect(onComplete).not.toHaveBeenCalled()

      await user.click(installButton)

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('when modal is "completed"', () => {
    it('calls onComplete', async () => {
      const user = userEvent.setup()
      render(
        <AppInstallModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />,
        { wrapper }
      )

      const installButton = await screen.findByText(
        'Install Codecov app via GitHub'
      )
      expect(installButton).toBeInTheDocument()

      expect(onComplete).not.toHaveBeenCalled()

      await user.click(installButton)

      expect(onComplete).toHaveBeenCalled()
    })

    it('renders install button as link with correct href', () => {
      render(
        <AppInstallModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />,
        { wrapper }
      )

      const link = screen.getByText('Install Codecov app via GitHub')
      expect(link).toHaveAttribute(
        'href',
        'https://github.com/apps/codecov/installations/new'
      )
    })
  })
})
