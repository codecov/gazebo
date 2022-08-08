import { render, screen, waitFor } from '@testing-library/react'

import { useFlags } from 'shared/featureFlags'

import App from './App'

jest.mock('./pages/AccountSettings', () => () => 'AccountSettings')
jest.mock('./pages/PlanPage/PlanPage', () => () => 'PlanPage')
jest.mock('./pages/MembersPage/MembersPage', () => () => 'MembersPage')
jest.mock('react-query/devtools', () => ({
  ReactQueryDevtools: () => 'ReactQueryDevtools',
}))
jest.mock('shared/featureFlags')

describe('App', () => {
  function setup() {
    useFlags.mockReturnValue({
      gazeboPlanTab: true,
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

  describe('rendering plan page', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test page', '/plan/gh/codecov/')
      setup()
    })

    it('renders the loading state', () => {
      const loading = screen.getByTestId('logo-spinner')
      expect(loading).toBeInTheDocument()
    })

    it('renders plan page', () => {
      return waitFor(() => {
        const page = screen.getByText(/PlanPage/i)
        expect(page).toBeInTheDocument()
      })
    })
  })

  describe('rendering members page', () => {
    beforeEach(() => {
      window.history.pushState({}, 'Test Members page', '/members/gh/codecov/')
      setup()
    })

    it('renders members page', () => {
      return waitFor(() => {
        const page = screen.getByText(/MembersPage/i)
        expect(page).toBeInTheDocument()
      })
    })
  })
})
