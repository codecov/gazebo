import { render, screen } from '@testing-library/react'
import HomePage from './HomePage'
import { useRepos } from 'services/repos/hooks'
import { MemoryRouter, Route } from 'react-router-dom'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('services/repos/hooks')
jest.mock('./OrgControlTable/ResyncButton', () => () => 'ResyncButton')
jest.mock('./Header', () => () => 'Header')
jest.mock('./ReposTable', () => () => 'ReposTable')

describe('HomePage', () => {
  function setup() {
    useRepos.mockReturnValue({
      data: {
        repos: [],
      },
    })

    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <HomePage />
        </Route>
        <Route path="/:provider/:owner">
          <HomePage />
        </Route>
      </MemoryRouter>
    )
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the children', () => {
      expect(screen.getByText(/Enabled/)).toBeInTheDocument()
    })

    it('renders the repo table', () => {
      expect(screen.getByText(/ReposTable/)).toBeInTheDocument()
    })

    it('renders the header', () => {
      expect(screen.getByText(/Header/)).toBeInTheDocument()
    })
  })
})
