import { waitFor, render, screen } from '@testing-library/react'
import App from './App'

jest.mock('./account/pages', () => () => 'AccountSettings')

describe('App', () => {
  describe('when rendering', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test page', '/account/gh/codecov/')
      render(<App />)
    })

    it('renders the loading state', () => {
      const loading = screen.getByText(/loading.../i)
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
