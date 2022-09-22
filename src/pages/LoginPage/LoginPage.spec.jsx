import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import LoginPage from './LoginPage'

describe('LoginPage', () => {
  function setup(url) {
    render(
      <MemoryRouter initialEntries={[url]}>
        <Switch>
          <Route path="/login/:provider">
            <LoginPage />
          </Route>
          <Route path="/login/">
            <LoginPage />
          </Route>
        </Switch>
      </MemoryRouter>
    )
  }

  describe('when the url is /login', () => {
    beforeEach(() => {
      setup('/login')
    })

    it('renders the three login button', () => {
      expect(
        screen.getByRole('link', {
          name: /login with github/i,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: /login with bitbucket/i,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: /login with gitlab/i,
        })
      ).toBeInTheDocument()
    })
  })

  describe('when the url is /login/gh', () => {
    beforeEach(() => {
      setup('/login/gh')
    })

    it('renders only the Github login button', () => {
      expect(
        screen.getByRole('link', {
          name: /login with github/i,
        })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('link', {
          name: /login with bitbucket/i,
        })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('link', {
          name: /login with gitlab/i,
        })
      ).not.toBeInTheDocument()
    })
  })
})
