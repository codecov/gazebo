import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoSettings } from 'services/repo'

import BadgesAndGraphsTab from './BadgesAndGraphsTab'

jest.mock('services/repo')
const queryClient = new QueryClient()

describe('BadgesAndGraphsTab', () => {
  function setup({ defaultBranch, graphToken }) {
    useRepoSettings.mockReturnValue({
      data: {
        repository: { defaultBranch, graphToken },
      },
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/settings">
            <BadgesAndGraphsTab />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('when rendered with graphToken', () => {
    beforeEach(() => {
      setup({ graphToken: 'WIO9JXFGE3' })
    })

    it('renders badges compoenent', () => {
      const title = screen.getByText(/Codecov badge/)
      expect(title).toBeInTheDocument()
    })
  })

  describe('when rendered with no graphToken', () => {
    beforeEach(() => {
      setup({ graphToken: null })
    })

    it('does not render badges compoenent', () => {
      const title = screen.queryByText(/Codecov badge/)
      expect(title).not.toBeInTheDocument()
    })
  })
})
