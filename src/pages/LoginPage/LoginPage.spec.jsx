import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import LoginPage from './LoginPage'

const wrapper =
  (initialEntries) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Switch>
          <Route path="/login/:provider">{children}</Route>
          <Route path="/login/"> {children}</Route>
        </Switch>
      </MemoryRouter>
    )

describe('LoginPage', () => {
  function setup() {
    const mockSetItem = jest.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = jest.spyOn(window.localStorage.__proto__, 'getItem')

    return { mockSetItem, mockGetItem }
  }

  afterEach(() => jest.resetAllMocks())

  describe('when the url is /login', () => {
    beforeEach(() => setup())

    it('renders the three login button', () => {
      render(<LoginPage />, { wrapper: wrapper('/login') })

      const githubLink = screen.getByRole('link', {
        name: /login with github/i,
      })
      expect(githubLink).toBeInTheDocument()

      const gitlabLink = screen.getByRole('link', {
        name: /login with gitlab/i,
      })
      expect(gitlabLink).toBeInTheDocument()

      const bitBucketLink = screen.getByRole('link', {
        name: /login with bitbucket/i,
      })
      expect(bitBucketLink).toBeInTheDocument()
    })
  })

  describe('when the url is /login/gh', () => {
    beforeEach(() => setup())

    it('renders only the Github login button', () => {
      render(<LoginPage />, { wrapper: wrapper('/login/gh') })

      const githubLink = screen.getByRole('link', {
        name: /login with github/i,
      })
      expect(githubLink).toBeInTheDocument()

      const gitlabLink = screen.queryByRole('link', {
        name: /login with gitlab/i,
      })
      expect(gitlabLink).not.toBeInTheDocument()

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

        expect(mockSetItem).toBeCalled()
        expect(mockSetItem).toBeCalledWith('sentry-token', 'cool state value')
      })
    })

    describe('when the url does not contain state search param', () => {
      it('does not set state value in local storage', () => {
        const { mockSetItem, mockGetItem } = setup()
        mockGetItem.mockReturnValue(false)

        render(<LoginPage />, {
          wrapper: wrapper('/login'),
        })

        expect(mockSetItem).not.toBeCalled()
      })
    })
  })
})
