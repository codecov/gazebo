import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useOwner } from 'services/user'

import AnalyticsPage from './AnalyticsPage'

vi.mock('services/user')
vi.mock('services/account')
vi.mock('services/navigation')
vi.mock('./Tabs', () => ({
  default: () => 'Tabs',
}))
vi.mock('./ChartSelectors', () => ({
  default: () => 'Chart Selectors',
}))
vi.mock('./Chart', () => ({
  default: () => 'Line Chart',
}))
vi.mock('../../shared/ListRepo/ReposTable', () => ({
  default: () => 'ReposTable',
}))

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/analytics/gh/codecov']}>
      <Route path="/analytics/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeEach(() => {
  queryClient.clear()
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
    it('renders tabs associated with the page', () => {
      setup({
        owner: { username: 'codecov', isCurrentUserPartOfOrg: true },
        params: { ordering: 'NAME', direction: 'ASC' },
      })
      render(<AnalyticsPage />, { wrapper })

      const tabs = screen.getByText(/Tabs/)
      expect(tabs).toBeInTheDocument()
    })

    it('renders a table displaying repository list', () => {
      setup({
        owner: { username: 'codecov', isCurrentUserPartOfOrg: true },
        params: { ordering: 'NAME', direction: 'ASC' },
      })
      render(<AnalyticsPage />, { wrapper })

      const repos = screen.getByText(/Repos/)
      expect(repos).toBeInTheDocument()
    })

    it('renders a selectors displaying chart options list', () => {
      setup({
        owner: { username: 'codecov', isCurrentUserPartOfOrg: true },
        params: { ordering: 'NAME', direction: 'ASC' },
      })
      render(<AnalyticsPage />, { wrapper })

      const chartSelectors = screen.getByText(/Chart Selectors/)
      expect(chartSelectors).toBeInTheDocument()
    })

    it('renders the line chart', () => {
      setup({
        owner: { username: 'codecov', isCurrentUserPartOfOrg: true },
        params: { ordering: 'NAME', direction: 'ASC' },
      })
      render(<AnalyticsPage />, { wrapper })

      const lineChart = screen.getByText(/Line Chart/)
      expect(lineChart).toBeInTheDocument()
    })
  })

  describe('when the owner does not exist', () => {
    it('does not render the header', () => {
      setup({ owner: null, params: null })
      render(<AnalyticsPage />, { wrapper })

      const header = screen.queryByText(/Header/)
      expect(header).not.toBeInTheDocument()
    })

    it('renders a not found error page', () => {
      setup({ owner: null, params: null })
      render(<AnalyticsPage />, { wrapper })

      const heading = screen.getByRole('heading', { name: /not found/i })
      expect(heading).toBeInTheDocument()
    })

    it('does not renders a repository table', () => {
      setup({ owner: null, params: null })
      render(<AnalyticsPage />, { wrapper })

      const repos = screen.queryByText(/Repos/)
      expect(repos).not.toBeInTheDocument()
    })

    it('does not render a selectors displaying chart options list', () => {
      setup({ owner: null, params: null })
      render(<AnalyticsPage />, { wrapper })

      const chartSelectors = screen.queryByText(/Chart Selectors/)
      expect(chartSelectors).not.toBeInTheDocument()
    })

    it('does not render the line chart', () => {
      setup({ owner: null, params: null })
      render(<AnalyticsPage />, { wrapper })

      const lineChart = screen.queryByText(/Line Chart/)
      expect(lineChart).not.toBeInTheDocument()
    })
  })

  describe('when user is not part of the org', () => {
    it('does not render Tabs', () => {
      setup({
        owner: { username: 'codecov', isCurrentUserPartOfOrg: false },
        params: { ordering: 'NAME', direction: 'ASC' },
      })
      render(<AnalyticsPage />, { wrapper })

      const tabs = screen.queryByText(/Tabs/)
      expect(tabs).not.toBeInTheDocument()
    })
  })

  describe('for the repos table', () => {
    it('renders a table displaying repository list', () => {
      setup({ owner: { username: 'codecov', isCurrentUserPartOfOrg: true } })
      render(<AnalyticsPage />, { wrapper })

      const repos = screen.getByText(/Repos/)
      expect(repos).toBeInTheDocument()
    })

    it('does not include a demo row', () => {
      setup({ owner: { username: 'codecov', isCurrentUserPartOfOrg: true } })
      render(<AnalyticsPage />, { wrapper })

      const demoRow = screen.queryByText(/Codecov demo/)
      expect(demoRow).not.toBeInTheDocument()
    })
  })
})
