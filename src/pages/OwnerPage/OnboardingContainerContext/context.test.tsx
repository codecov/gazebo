import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER } from 'pages/OwnerPage/OnboardingOrg/constants'
import { ONBOARDING_SOURCE } from 'pages/TermsOfService/constants'

import { OnboardingContainerProvider, useOnboardingContainer } from './context'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={[`/gh?source=${ONBOARDING_SOURCE}`]}>
    <Switch>
      <Route exact path="/:provider">
        <OnboardingContainerProvider>{children}</OnboardingContainerProvider>
      </Route>
    </Switch>
  </MemoryRouter>
)

const noQueryParamWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <MemoryRouter initialEntries={[`/gh`]}>
    <Switch>
      <Route exact path="/:provider">
        <OnboardingContainerProvider>{children}</OnboardingContainerProvider>
      </Route>
    </Switch>
  </MemoryRouter>
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
      expect(() => render(<TestComponent />)).toThrow(
        'useOnboardingContainer has to be used within `<OnboardingContainerProvider>`'
      )
    })
  })

  describe('when called inside provider', () => {
    it('initializes with false when no localStorage value exists', () => {
      render(<TestComponent />, { wrapper: noQueryParamWrapper })

      expect(screen.getByText('Show container: false')).toBeInTheDocument()
    })

    it('initializes with true when source param is onboarding', () => {
      render(<TestComponent />, { wrapper })

      expect(screen.getByText('Show container: true')).toBeInTheDocument()
      expect(
        localStorage.getItem(LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER)
      ).toBe('true')
    })

    it('initializes with stored localStorage value', () => {
      localStorage.setItem(LOCAL_STORAGE_SHOW_ONBOARDING_CONTAINER, 'true')

      render(<TestComponent />, { wrapper: noQueryParamWrapper })

      expect(screen.getByText('Show container: true')).toBeInTheDocument()
    })

    it('can toggle the container visibility', async () => {
      const user = userEvent.setup()

      render(<TestComponent />, { wrapper })

      expect(screen.getByText('Show container: true')).toBeInTheDocument()

      const button = screen.getByRole('button', { name: 'toggle container' })
      await user.click(button)

      expect(screen.getByText('Show container: false')).toBeInTheDocument()
    })
  })
})
