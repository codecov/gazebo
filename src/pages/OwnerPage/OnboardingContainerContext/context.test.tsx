import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER } from 'pages/OwnerPage/OnboardingOrg/constants'
import { ONBOARDING_SOURCE } from 'pages/TermsOfService/constants'

import { OnboardingContainerProvider, useOnboardingContainer } from './context'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter>{children}</MemoryRouter>
)

const TestComponent = () => {
  const { showOnboardingContainer, setShowOnboardingContainer } =
    useOnboardingContainer()

  return (
    <div>
      <div>Show container: {showOnboardingContainer.toString()}</div>
      <button
        onClick={() => {
          setShowOnboardingContainer(!showOnboardingContainer)
        }}
      >
        toggle container
      </button>
    </div>
  )
}

describe('OnboardingContainer context', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('when called outside of provider', () => {
    it('throws error', () => {
      console.error = () => {}
      expect(() => render(<TestComponent />, { wrapper })).toThrow(
        'useOnboardingContainer has to be used within `<OnboardingContainerProvider>`'
      )
    })
  })

  describe('when called inside provider', () => {
    it('initializes with false when no localStorage value exists', () => {
      render(
        <OnboardingContainerProvider>
          <TestComponent />
        </OnboardingContainerProvider>,
        { wrapper }
      )

      expect(screen.getByText('Show container: false')).toBeInTheDocument()
    })

    it('initializes with true when source param is onboarding', () => {
      render(
        <MemoryRouter initialEntries={[`/?source=${ONBOARDING_SOURCE}`]}>
          <OnboardingContainerProvider>
            <TestComponent />
          </OnboardingContainerProvider>
        </MemoryRouter>
      )

      expect(screen.getByText('Show container: true')).toBeInTheDocument()
      expect(
        localStorage.getItem(LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER)
      ).toBe('true')
    })

    it('initializes with stored localStorage value', () => {
      localStorage.setItem(LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER, 'true')

      render(
        <OnboardingContainerProvider>
          <TestComponent />
        </OnboardingContainerProvider>,
        { wrapper }
      )

      expect(screen.getByText('Show container: true')).toBeInTheDocument()
    })

    it('can toggle the container visibility', async () => {
      const user = userEvent.setup()

      render(
        <OnboardingContainerProvider>
          <TestComponent />
        </OnboardingContainerProvider>,
        { wrapper }
      )

      expect(screen.getByText('Show container: false')).toBeInTheDocument()

      const button = screen.getByRole('button', { name: 'toggle container' })
      await user.click(button)

      expect(screen.getByText('Show container: true')).toBeInTheDocument()
    })
  })
})
