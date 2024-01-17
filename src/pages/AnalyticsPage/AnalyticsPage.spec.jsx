import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useOwner } from 'services/user'

import AnalyticsPage from './AnalyticsPage'

jest.mock('./Header', () => () => 'Header')
jest.mock('services/user')
jest.mock('services/account')
jest.mock('services/navigation')
jest.mock('./Tabs', () => () => 'Tabs')
jest.mock('./ChartSelectors', () => () => 'Chart Selectors')
jest.mock('./Chart', () => () => 'Line Chart')
jest.mock('../../shared/ListRepo/ReposTable', () => () => 'ReposTable')

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/analytics/gh/codecov']}>
      <Route path="/analytics/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
  console.error = () => {}
})
beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('AnalyticsPage', () => {
  function setup({ owner, params }) {
    useOwner.mockReturnValue({
      data: owner,
    })
    useLocationParams.mockReturnValue({
      params: {
        ordering: params?.ordering,
        direction: params?.direction,
      },
    })
  }

  describe('when the owner exists', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
        params: {
          ordering: 'NAME',
          direction: 'ASC',
        },
      })
    })

    it('renders the header', () => {
      render(<AnalyticsPage />, { wrapper })
      expect(screen.getByText(/Header/)).toBeInTheDocument()
    })

    it('renders tabs associated with the page', () => {
      render(<AnalyticsPage />, { wrapper })
      expect(screen.getByText(/Tabs/)).toBeInTheDocument()
    })

    it('renders a table displaying repository list', () => {
      render(<AnalyticsPage />, { wrapper })
      expect(screen.getByText(/Repos/)).toBeInTheDocument()
    })

    it('renders a selectors displaying chart options list', () => {
      render(<AnalyticsPage />, { wrapper })
      expect(screen.getByText(/Chart Selectors/)).toBeInTheDocument()
    })

    it('renders the line chart', () => {
      render(<AnalyticsPage />, { wrapper })
      expect(screen.getByText(/Line Chart/)).toBeInTheDocument()
    })
  })

  describe('when the owner doesnt exist', () => {
    beforeEach(() => {
      setup({
        owner: null,
        params: null,
      })
    })

    it('does not render the header', () => {
      render(<AnalyticsPage />, { wrapper })
      expect(screen.queryByText(/Header/)).not.toBeInTheDocument()
    })

    it('renders a not found error page', () => {
      render(<AnalyticsPage />, { wrapper })
      expect(
        screen.getByRole('heading', {
          name: /not found/i,
        })
      ).toBeInTheDocument()
    })

    it('does not renders a repository table', () => {
      render(<AnalyticsPage />, { wrapper })
      expect(screen.queryByText(/Repos/)).not.toBeInTheDocument()
    })

    it('does not render a selectors displaying chart options list', () => {
      render(<AnalyticsPage />, { wrapper })
      expect(screen.queryByText(/Chart Selectors/)).not.toBeInTheDocument()
    })

    it('does not render the line chart', () => {
      render(<AnalyticsPage />, { wrapper })
      expect(screen.queryByText(/Line Chart/)).not.toBeInTheDocument()
    })
  })

  describe('when user is not part of the org', () => {
    beforeEach(() => {
      setup({
        owner: {
          owner: {
            username: 'codecov',
            isCurrentUserPartOfOrg: false,
          },
        },
        params: {
          ordering: 'NAME',
          direction: 'ASC',
        },
      })
    })

    it('does not render Tabs', () => {
      render(<AnalyticsPage />, { wrapper })
      expect(screen.queryByText(/Tabs/)).not.toBeInTheDocument()
    })
  })
})
