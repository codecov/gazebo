import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { ThemeContextProvider } from 'shared/ThemeContext'

import LoginButton from './LoginButton'

window.matchMedia = vi.fn().mockResolvedValue({ matches: false })

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
  afterAll(() => {
    vi.clearAllMocks()
  })
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
})
