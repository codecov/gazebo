import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import LoginButton from './LoginButton'

jest.mock('shared/featureFlags')

let testLocation
const wrapper =
  ({ initialEntries, path }) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path={path} exact>
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

  describe('bitbucket', () => {
    it('renders bitbucket login button', () => {
      setup()

      render(<LoginButton provider="bb" />, {
        wrapper: wrapper({
          initialEntries: '/login/bb',
          path: '/login/:provider',
        }),
      })

      const bitbucket = screen.getByText(/Login with Bitbucket/i)
      expect(bitbucket).toBeInTheDocument()
    })
  })

  describe('github', () => {
    it('renders github login button', () => {
      setup()

      render(<LoginButton provider="gh" />, {
        wrapper: wrapper({
          initialEntries: '/login/gh',
          path: '/login/:provider',
        }),
      })

      const github = screen.getByText(/Login with GitHub/i)
      expect(github).toBeInTheDocument()
    })
  })

  describe('gitlab', () => {
    it('renders gitlab login button', () => {
      setup()

      render(<LoginButton provider="gl" />, {
        wrapper: wrapper({
          initialEntries: '/login/gl',
          path: '/login/:provider',
        }),
      })

      const gitlab = screen.getByText(/Login with GitLab/i)
      expect(gitlab).toBeInTheDocument()
    })
  })

  describe('sentry', () => {
    describe('flag is enabled', () => {
      it('renders sentry login button', () => {
        setup(true)
        render(<LoginButton provider="sentry" />, {
          wrapper: wrapper({
            initialEntries: '/login/sentry',
            path: '/login/:provider',
          }),
        })

        const sentry = screen.getByText(/Login with Sentry/i)
        expect(sentry).toBeInTheDocument()
      })
    })

    describe('flag is disabled', () => {
      describe('provider is set to sentry', () => {
        it('redirects the user to base login page', async () => {
          setup(false)
          render(<LoginButton provider="sentry" />, {
            wrapper: wrapper({
              initialEntries: '/login/sentry',
              path: '/login/:provider',
            }),
          })

          await waitFor(() => expect(testLocation.pathname).toBe('/login'))
        })
      })

      describe('on root login route', () => {
        it('renders nothing', () => {
          setup(false)

          const { container } = render(<LoginButton provider="sentry" />, {
            wrapper: wrapper({
              initialEntries: '/login',
              path: '/login',
            }),
          })

          expect(container).toBeEmptyDOMElement()
        })
      })
    })
  })
})
