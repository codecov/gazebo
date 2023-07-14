import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import LoginButton from './LoginButton'

jest.mock('shared/featureFlags')

let testLocation
const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider" exact>
          <div>Click away</div>
          {children}
        </Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    )

describe('LoginButton', () => {
  function setup(flagValue = false) {
    useFlags.mockReturnValue({
      sentryLoginProvider: flagValue,
    })
  }

  describe('provider is bitbucket', () => {
    it('renders bitbucket login button', () => {
      setup()

      render(<LoginButton provider="bb" />, { wrapper: wrapper() })

      const bitbucket = screen.getByText(/Login with Bitbucket/i)
      expect(bitbucket).toBeInTheDocument()
    })
  })

  describe('provider is github', () => {
    it('renders github login button', () => {
      setup()

      render(<LoginButton provider="gh" />, { wrapper: wrapper() })

      const github = screen.getByText(/Login with GitHub/i)
      expect(github).toBeInTheDocument()
    })
  })

  describe('provider is gitlab', () => {
    it('renders gitlab login button', () => {
      setup()

      render(<LoginButton provider="gl" />, { wrapper: wrapper() })

      const gitlab = screen.getByText(/Login with GitLab/i)
      expect(gitlab).toBeInTheDocument()
    })
  })

  describe('provider is sentry', () => {
    describe('flag is enabled', () => {
      it('renders sentry login button', () => {
        setup(true)
        render(<LoginButton provider="sentry" />, { wrapper: wrapper() })

        const sentry = screen.getByText(/Login with Sentry/i)
        expect(sentry).toBeInTheDocument()
      })
    })

    describe('flag is disabled', () => {
      it('redirects the user to base login page', async () => {
        setup(false)
        render(<LoginButton provider="sentry" />, { wrapper: wrapper() })

        await waitFor(() => expect(testLocation.pathname).toBe('/login'))
      })
    })
  })
})
