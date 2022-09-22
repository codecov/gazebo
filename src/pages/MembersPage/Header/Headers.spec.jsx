import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useOwner } from 'services/user'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('services/user')

const queryClient = new QueryClient()

describe('Header', () => {
  function setup() {
    useOwner.mockReturnValue({
      owner: {
        username: 'lancelot',
      },
    })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/members/gh/codecov']}>
          <Route path="/members/:provider/:owner">
            <Header />
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('render', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the context switcher', () => {
      expect(screen.getByText(/MyContextSwitcher/)).toBeInTheDocument()
    })
  })
})
