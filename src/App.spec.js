import { render, screen, waitFor } from '@testing-library/react'

import App from './App'
import { useFlags } from 'shared/featureFlags'

jest.mock('./pages/AccountSettings', () => () => 'AccountSettings')
jest.mock('react-query/devtools', () => ({
  ReactQueryDevtools: () => 'ReactQueryDevtools',
}))
jest.mock('shared/featureFlags')

describe('App', () => {
  function setup() {
    useFlags.mockReturnValue({
      gazeboBillingsTab: true,
    })
    render(<App />)
  }

  describe('when rendering', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test page', '/account/gh/codecov/')
      setup()
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

  describe('',()=>{
    beforeEach(() => {
      window.history.pushState({}, 'Test page', '/billing/gh/codecov/')
      setup()
    })

    it('renders the loading state', () => {
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders billing page', () => {
      return waitFor(() => {
        const page = screen.getByText(/Current org plan/i)
        expect(page).toBeInTheDocument()
      })
    })
  })
})
