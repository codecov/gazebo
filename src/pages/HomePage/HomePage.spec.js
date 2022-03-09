import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { useUser } from 'services/user'

import HomePage from './HomePage'

jest.mock('./Header', () => () => 'Header')
jest.mock('shared/ListRepo', () => () => 'ListRepo')
jest.mock('services/user')

beforeEach(() => {
  useUser.mockClear()
})

describe('HomePage', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Switch>
          <Route path="/login">LoginPage</Route>
          <Route path="/:provider">
            <HomePage />
          </Route>
        </Switch>
      </MemoryRouter>
    )
  }

  describe('when user is authenticated', () => {
    beforeEach(() => {
      useUser.mockReturnValue({
        data: {
          user: {
            username: 'hamilton',
          },
        },
      })
      setup()
    })

    it('renders the ListRepo', () => {
      expect(screen.getByText(/ListRepo/)).toBeInTheDocument()
    })

    it('renders the header', () => {
      expect(screen.getByText(/Header/)).toBeInTheDocument()
    })
  })

  describe('when the data is loading', () => {
    beforeEach(() => {
      useUser.mockReturnValue({
        isLoading: true,
      })
      setup()
    })

    it('renders the Spinner', () => {
      expect(screen.getByTestId('logo-spinner')).toBeInTheDocument()
    })
  })

  describe('when fetching the data failed', () => {
    beforeEach(() => {
      useUser.mockReturnValue({
        isLoading: true,
      })
      setup()
      useUser.mock.calls[0][0].onError()
    })

    it('redirects to login', () => {
      expect(screen.getByText('LoginPage')).toBeInTheDocument()
    })
  })
})
