import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import CurrentRepoSettings from './CurrentRepoSettings'

jest.mock('services/repo')

const queryClient = new QueryClient()

describe('CurrentRepoSettings', () => {
  function setup(botUsername) {
    render(
      <MemoryRouter initialEntries={['/gh/codecov/codecov-client/yaml']}>
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/yaml">
            <CurrentRepoSettings
              botUsername={botUsername}
              defaultBranch="random branch"
            />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('renders CurrentRepoSettings', () => {
    beforeEach(() => {
      setup('random bot')
    })
    it('renders title', () => {
      const title = screen.getByText(/Current repository settings/)
      expect(title).toBeInTheDocument()
    })
    it('renders CurrentRepoSettings compoenent body', () => {
      const p1 = screen.getByText(/Current bot: random bot/)
      const p2 = screen.getByText(/Current default branch: random branch/)
      expect(p1).toBeInTheDocument()
      expect(p2).toBeInTheDocument()
    })
  })

  describe('renders CurrentRepoSettings with no botUsername', () => {
    beforeEach(() => {
      setup()
    })
    it('renders none as a botUsername value', () => {
      const bot = screen.getByText(/Current bot: none/)
      expect(bot).toBeInTheDocument()
    })
  })
})
