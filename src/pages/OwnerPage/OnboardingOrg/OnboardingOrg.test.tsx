import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type Mock, vi } from 'vitest'

import { useLocationParams } from 'services/navigation'

import { LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER } from './constants'
import OnboardingOrg from './OnboardingOrg'

import { OnboardingContainerProvider } from '../OnboardingContainerContext/context'

vi.mock('services/navigation', async () => {
  const servicesNavigation = await vi.importActual('services/navigation')

  return {
    ...servicesNavigation,
    useLocationParams: vi.fn(),
  }
})

const mockedUseLocationParams = useLocationParams as Mock

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <OnboardingContainerProvider>{children}</OnboardingContainerProvider>
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

  it('handles dismiss button click correctly', async () => {
    const user = userEvent.setup()
    render(<OnboardingOrg />, { wrapper })

    // const dismissButton = screen.getByText('Dismiss')
    const dismissButton = screen.getByTestId('dismiss-onboarding-org')
    expect(dismissButton).toBeInTheDocument()
    await user.click(dismissButton)

    expect(localStorage.getItem(LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER)).toBe(
      'false'
    )
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
})
