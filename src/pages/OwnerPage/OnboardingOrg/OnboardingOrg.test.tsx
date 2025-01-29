import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'
import { type Mock, vi } from 'vitest'

import { eventTracker } from 'services/events/events'
import { useLocationParams } from 'services/navigation'

import OnboardingOrg from './OnboardingOrg'

import { OnboardingContainerProvider } from '../OnboardingContainerContext/context'

vi.mock('services/navigation', async () => {
  const servicesNavigation = await vi.importActual('services/navigation')

  return {
    ...servicesNavigation,
    useLocationParams: vi.fn(),
  }
})
vi.mock('services/events/events')

const mockedUseLocationParams = useLocationParams as Mock

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, suspense: false },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo']}>
      <Route path={'/:provider/:owner/:repo'} exact>
        <OnboardingContainerProvider>{children}</OnboardingContainerProvider>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('OnboardingOrg', () => {
  beforeEach(() => {
    localStorage.clear()
    mockedUseLocationParams.mockReturnValue({ params: {} })
  })

  it('renders the component correctly', () => {
    render(<OnboardingOrg />, { wrapper })

    expect(
      screen.getByText('How to integrate another organization to Codecov')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Add your GitHub Organization to Codecov')
    ).toBeInTheDocument()
    expect(screen.getByText('Install Codecov')).toBeInTheDocument()
    expect(screen.getByText('Dismiss')).toBeInTheDocument()
    expect(
      screen.getByAltText('GitHub Organization Install List Example')
    ).toBeInTheDocument()
  })

  it('opens and closes the AppInstallModal', async () => {
    const user = userEvent.setup()
    render(<OnboardingOrg />, { wrapper })

    // Modal should be closed initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Click install button to open the modal
    const installButton = screen.getByText('Install Codecov')
    await user.click(installButton)

    // Modal should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    await user.click(cancelButton)

    // Modal should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('emits an event on clicking Install Codecov', async () => {
    const user = userEvent.setup()
    render(<OnboardingOrg />, { wrapper })

    // Modal should be closed initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Click install button to open the modal
    const installButton = screen.getByText('Install Codecov')
    await user.click(installButton)

    expect(eventTracker().track).toHaveBeenCalledWith({
      type: 'Button Clicked',
      properties: {
        buttonName: 'Open App Install Modal',
        buttonLocation: 'Onboarding Container',
      },
    })
  })
})
