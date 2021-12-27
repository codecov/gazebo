import { render, screen } from '@testing-library/react'
import { Route, MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from 'react-query'
import { usePulls } from 'services/pulls/hooks'
import PullsPage from './PullsPage'

jest.mock('services/pulls/hooks')

describe('Pulls Page', () => {
  function setup() {
    usePulls.mockReturnValue({
      data: [
        {
          node: {
            author: { username: 'RulaKhaled' },
            compareWithBase: {
              patchTotals: {
                coverage: 90,
              },
            },
            head: {
              totals: {
                coverage: 45,
              },
            },
            pullId: 746,
            state: 'MERGED',
            title: 'Test1',
            updatestamp: '2021-08-30T19:33:49.819672',
          },
        },
        {
          node: {
            author: { username: 'ThiagoCodecov' },
            compareWithBase: {
              patchTotals: {
                coverage: 87,
              },
            },
            head: {
              totals: {
                coverage: 100,
              },
            },
            pullId: 745,
            state: 'OPEN',
            title: 'Test2',
            updatestamp: '2021-07-30T19:33:49.819672',
          },
        },
      ],
    })

    const queryClient = new QueryClient()
    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/pulls']}>
        <Route path="/:provider/:owner/:repo/pulls">
          <QueryClientProvider client={queryClient}>
            <PullsPage />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders with table name heading', () => {
      const head = screen.getByText(/Name/)
      expect(head).toBeInTheDocument()
    })

    it('renders with table coverage heading', () => {
      const head = screen.getByText(/Coverage on/)
      expect(head).toBeInTheDocument()
    })

    it('renders with table change heading', () => {
      const head = screen.getByText(/Change from/)
      expect(head).toBeInTheDocument()
    })

    it('renders select by updatestamp label', () => {
      const label = screen.getByText(/Sort by:/)
      expect(label).toBeInTheDocument()
    })

    it('renders view by state label', () => {
      const label = screen.getByText(/View:/)
      expect(label).toBeInTheDocument()
    })

    it('renders default of select by updatestamp', () => {
      const label = screen.getByText(/All/)
      expect(label).toBeInTheDocument()
    })

    it('renders default of select by state', () => {
      const label = screen.getByText(/Newest/)
      expect(label).toBeInTheDocument()
    })
  })
})
