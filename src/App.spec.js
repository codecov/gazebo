import { waitFor, render, screen } from '@testing-library/react'
import App from './App'

jest.mock('./pages/AccountSettings', () => () => 'AccountSettings')
jest.mock('react-query/devtools', () => ({
  ReactQueryDevtools: () => 'ReactQueryDevtools',
}))

describe('App', () => {
  describe('when rendering', () => {
    const setup = () => render(<App />)
    beforeEach(() => {
      window.history.pushState({}, 'Test page', '/account/gh/codecov/')
    })

    it('renders the loading state', () => {
      setup()
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders the AccountSettings page', () => {
      setup()
      return waitFor(() => {
        const page = screen.getByText(/AccountSettings/i)
        expect(page).toBeInTheDocument()
      })
    })
  })
})
