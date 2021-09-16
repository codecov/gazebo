import { waitFor, render, screen } from '@testing-library/react'
import App from './App'

jest.mock('./pages/AccountSettings', () => () => 'AccountSettings')
jest.mock('react-query/devtools', () => ({
  ReactQueryDevtools: () => 'ReactQueryDevtools',
}))

describe('App', () => {
  describe('when rendering', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test page', '/account/gh/codecov/')
      render(<App />)
    })

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
})
