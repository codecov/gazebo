import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { eventTracker } from 'services/events/events'
import { ThemeContextProvider } from 'shared/ThemeContext'

import LoginButton from './LoginButton'

vi.mock('services/events/events')

const wrapper =
  ({ initialEntries, path }) =>
  ({ children }) => (
    <ThemeContextProvider>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path={path} exact>
          {children}
        </Route>
      </MemoryRouter>
    </ThemeContextProvider>
  )

describe('LoginButton', () => {
  describe('bitbucket', () => {
    it('renders bitbucket login button', () => {
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
    it('renders sentry login button', () => {
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

  it('emits event on click', () => {
    render(<LoginButton provider="gh" />, {
      wrapper: wrapper({
        initialEntries: '/login/gh',
        path: '/login/:provider',
      }),
    })

    const github = screen.getByText(/Login with GitHub/i)
    expect(github).toBeInTheDocument()

    act(() => github.click())

    expect(eventTracker().track).toHaveBeenCalledWith({
      type: 'Button Clicked',
      properties: {
        buttonName: 'Login',
        buttonLocation: 'Login Page',
        loginProvider: 'GitHub',
      },
    })
  })
})
