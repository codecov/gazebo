import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePlanPageData } from 'pages/PlanPage/hooks'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('pages/PlanPage/hooks')

const queryClient = new QueryClient()

describe('Header', () => {
  function setup() {
    usePlanPageData.mockReturnValue({
      owner: {
        username: 'dwight',
      },
    })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/plan/gh/codecov']}>
          <Route path="/plan/:provider/:owner">
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
