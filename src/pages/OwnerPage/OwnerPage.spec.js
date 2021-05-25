import { render, screen } from '@testing-library/react'
import OwnerPage from './OwnerPage'
import { useRepos } from 'services/repos/hooks'
import { MemoryRouter, Route } from 'react-router-dom'

jest.mock('services/repos/hooks')
jest.mock('./Header', () => () => 'Header')
jest.mock('shared/ListRepo', () => () => 'ListRepo')

describe('OwnerPage', () => {
  function setup() {
    useRepos.mockReturnValue({
      data: {
        repos: [],
      },
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">
          <OwnerPage />
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
