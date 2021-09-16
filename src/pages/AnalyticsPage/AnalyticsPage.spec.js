import { render, screen } from '@testing-library/react'
import AnalyticsPage from './AnalyticsPage'
import { useOwner } from 'services/user'
import { useLocationParams } from 'services/navigation'
import { MemoryRouter, Route } from 'react-router-dom'

jest.mock('./Header', () => () => 'Header')
jest.mock('services/user')
jest.mock('services/account')
jest.mock('services/navigation')
jest.mock('./Tabs', () => () => 'Tabs')
jest.mock('./ChartSelectors', () => () => 'Chart Selectors')
jest.mock('./Chart', () => () => 'Line Chart')
jest.mock('../../shared/ListRepo/ReposTable', () => () => 'ReposTable')

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
    render(
      <MemoryRouter initialEntries={['/analytics/gh/codecov']}>
        <Route path="/analytics/:provider/:owner">
          <AnalyticsPage />
        </Route>
      </MemoryRouter>
    )
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
      expect(screen.getByText(/Header/)).toBeInTheDocument()
    })

    it('renders tabs associated with the page', () => {
      expect(screen.queryByText(/Tabs/)).toBeInTheDocument()
    })

    it('renders a table displaying repository list', () => {
      expect(screen.queryByText(/Repos/)).toBeInTheDocument()
    })

    it('renders a selectors displaying chart options list', () => {
      expect(screen.queryByText(/Chart Selectors/)).toBeInTheDocument()
    })

    it('renders the line chart', () => {
      expect(screen.queryByText(/Line Chart/)).toBeInTheDocument()
    })
  })

  describe('when the owner doesnt exist', () => {
    beforeEach(() => {
      setup({
        owner: null,
        params: null,
      })
    })

    it('doesnt render the header', () => {
      expect(screen.queryByText(/Header/)).not.toBeInTheDocument()
    })

    it('renders a not found error page', () => {
      expect(
        screen.getByRole('heading', {
          name: /not found/i,
        })
      ).toBeInTheDocument()
    })

    it('does not renders a repository table', () => {
      expect(screen.queryByText(/Repos/)).not.toBeInTheDocument()
    })

    it('does not render a selectors displaying chart options list', () => {
      expect(screen.queryByText(/Chart Selectors/)).not.toBeInTheDocument()
    })

    it('does not render the line chart', () => {
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

    it('doesnt render Tabs', () => {
      expect(screen.queryByText(/Tabs/)).not.toBeInTheDocument()
    })
  })
})
