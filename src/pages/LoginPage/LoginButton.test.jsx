import { act, render, screen } from '@testing-library/react'
import qs from 'qs'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { eventTracker } from 'services/events/events'
import { ThemeContextProvider } from 'shared/ThemeContext'

import LoginButton from './LoginButton'

vi.mock('services/events/events')

vi.mock('config')
config.API_URL = 'secret-api-url'

const { location } = window

beforeEach(() => {
  delete window.location
  window.location = {
    ...location,
    protocol: 'http:',
    host: 'secret-api-url',
  }
})

afterEach(() => {
  window.location = location
})

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

  it('appends the correct redirect query string', () => {
    render(<LoginButton provider="gh" />, {
      wrapper: wrapper({
        initialEntries: '/login/gh?to=https://example.com',
        path: '/login/:provider',
      }),
    })

    const redirectQueryString = qs.stringify({ to: 'https://example.com' })
    const toQueryString = qs.stringify({
      to: `http://secret-api-url/gh?${redirectQueryString}`,
    })

    const github = screen.getByText(/Login with GitHub/i)
    expect(github).toHaveAttribute(
      'href',
      `secret-api-url/login/gh?${toQueryString}`
    )
  })
})
