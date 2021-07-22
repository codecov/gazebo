import { render, screen } from '@testing-library/react'
import HomePage from './HomePage'
import { MemoryRouter, Route } from 'react-router-dom'

jest.mock('./Header', () => () => 'Header')
jest.mock('shared/ListRepo', () => () => 'ListRepo')
jest.mock('services/user', () => ({
  useUser: () => ({
    data: {
      user: {
        username: 'hamilton',
      },
    },
  }),
}))

describe('HomePage', () => {
  function setup() {
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <HomePage />
        </Route>
      </MemoryRouter>
    )
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the ListRepo', () => {
      expect(screen.getByText(/ListRepo/)).toBeInTheDocument()
    })

    it('renders the header', () => {
      expect(screen.getByText(/Header/)).toBeInTheDocument()
    })
  })
})
