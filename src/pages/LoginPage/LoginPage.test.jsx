import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { ThemeContextProvider } from 'shared/ThemeContext'

import LoginPage from './LoginPage'

const wrapper =
  (initialEntries) =>
  ({ children }) => (
    <ThemeContextProvider>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Switch>
          <Route path="/login/:provider">{children}</Route>
          <Route path="/login/"> {children}</Route>
        </Switch>
      </MemoryRouter>
    </ThemeContextProvider>
  )

describe('LoginPage', () => {
  function setup() {
    const mockSetItem = vi.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = vi.spyOn(window.localStorage.__proto__, 'getItem')

    return { mockSetItem, mockGetItem }
  }

  afterEach(() => vi.clearAllMocks())

  describe('rendering DEC message', () => {
    it('renders the message', () => {
      setup()
      render(<LoginPage />, { wrapper: wrapper('/login') })

      const message = screen.getByText(/If you are using GitHub/)
      expect(message).toBeInTheDocument()
    })

    it('renders the docs link', () => {
      setup()
      render(<LoginPage />, { wrapper: wrapper('/login') })

      const link = screen.getByRole('link', {
        name: /dedicated enterprise cloud/i,
      })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/codecov-dedicated-enterprise-cloud-install-steps'
      )
    })
  })

  describe('when the url is /login', () => {
    it('renders github login button', () => {
      render(<LoginPage />, { wrapper: wrapper('/login') })

      const githubLink = screen.getByRole('link', {
        name: /Log in with github/i,
      })
      expect(githubLink).toBeInTheDocument()
    })

    it('renders sentry login button', () => {
      render(<LoginPage />, { wrapper: wrapper('/login') })

      const sentryLink = screen.getByRole('link', {
        name: /Log in with sentry/i,
      })
      expect(sentryLink).toBeInTheDocument()
    })

    it('renders gitlab login button', () => {
      render(<LoginPage />, { wrapper: wrapper('/login') })

      const gitlabLink = screen.getByRole('link', {
        name: /Log in with gitlab/i,
      })
      expect(gitlabLink).toBeInTheDocument()
    })

    it('renders bitbucket login button', () => {
      render(<LoginPage />, { wrapper: wrapper('/login') })

      const bitBucketLink = screen.getByRole('link', {
        name: /Log in with bitbucket/i,
      })
      expect(bitBucketLink).toBeInTheDocument()
    })
  })

  describe('when the url is /login/gh', () => {
    beforeEach(() => setup())

    it('renders the GitHub login button', () => {
      render(<LoginPage />, { wrapper: wrapper('/login/gh') })

      const githubLink = screen.getByRole('link', {
        name: /Log in with github/i,
      })
      expect(githubLink).toBeInTheDocument()
    })

    it('does not render the gitlab login button', () => {
      render(<LoginPage />, { wrapper: wrapper('/login/gh') })

      const gitlabLink = screen.queryByRole('link', {
        name: /login with gitlab/i,
      })
      expect(gitlabLink).not.toBeInTheDocument()
    })

    it('does not render bitbucket login button', () => {
      render(<LoginPage />, { wrapper: wrapper('/login/gh') })

      const bitbucketLink = screen.queryByRole('link', {
        name: /login with bitbucket/i,
      })
      expect(bitbucketLink).not.toBeInTheDocument()
    })
  })

  describe('setting state param in local storage', () => {
    describe('when the url contains state search param', () => {
      it('sets state value in local storage', () => {
        const { mockSetItem, mockGetItem } = setup()
        mockGetItem.mockReturnValue(false)

        render(<LoginPage />, {
          wrapper: wrapper('/login?state=cool%20state%20value'),
        })

        expect(mockSetItem).toHaveBeenCalled()
        expect(mockSetItem).toHaveBeenCalledWith(
          'sentry-token',
          'cool state value'
        )
      })
    })

    describe('when the url does not contain state search param', () => {
      it('does not set state value in local storage', () => {
        const { mockSetItem, mockGetItem } = setup()
        mockGetItem.mockReturnValue(false)

        render(<LoginPage />, {
          wrapper: wrapper('/login'),
        })

        expect(mockSetItem).not.toHaveBeenCalledWith('sentry-token')
      })
    })
  })
})
