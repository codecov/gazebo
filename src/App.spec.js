import { waitFor, render, screen } from '@testing-library/react'
import App from './App'

jest.mock('./pages/AccountSettings', () => () => 'AccountSettings')
jest.mock('react-query/devtools', () => ({
  ReactQueryDevtools: () => 'ReactQueryDevtools',
}))

describe('App', () => {
  function setup(route) {
    beforeEach(() => {
      window.history.pushState({}, 'Test page', route)
      render(<App />)
    })
  }

  describe('when rendered with account settings route', () => {
    setup('/account/gh/codecov')

    it('renders the loading state', () => {
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders the AccountSettings page', () => {
      return waitFor(() => {
        const page = screen.getByText(/AccountSettings/i)
        expect(page).toBeInTheDocument()
      })
    })
  })

  describe('when rendering with login nd repo route', () => {
    setup('/login/gh/someRepo')

    it('renders the error page', () => {
      return waitFor(() => {
        const page = screen.getByText(/404 error/i)
        expect(page).toBeInTheDocument()
      })
    })
  })
})
