import { render, screen } from '@testing-library/react'
import { Route, MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from 'react-query'
import { useCommits } from 'services/commits/hooks'
import CommitsPage from './CommitsPage'
import userEvent from '@testing-library/user-event'

jest.mock('services/commits/hooks')

describe('Commits Page', () => {
  function setup() {
    useCommits.mockReturnValue({
      data: [
        {
          author: { username: 'RulaKhaled' },
          compareWithParent: {
            patchTotals: {
              coverage: 90,
            },
          },
          totals: {
            coverage: 45,
          },
          commitid: 'id',
          message: 'Test1',
          createdAt: '2021-08-30T19:33:49.819672',
        },
        {
          author: { username: 'Terry' },
          compareWithParent: {
            patchTotals: {
              coverage: 55,
            },
          },
          totals: {
            coverage: 59,
          },
          commitid: 'id',
          message: 'Test2',
          createdAt: '2021-08-30T19:33:49.819672',
        },
      ],
    })

    const queryClient = new QueryClient()
    render(
      <MemoryRouter initialEntries={['/gh/codecov/gazebo/commits']}>
        <Route path="/:provider/:owner/:repo/commits">
          <QueryClientProvider client={queryClient}>
            <CommitsPage />
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
      const head = screen.getByText(/Coverage/)
      expect(head).toBeInTheDocument()
    })

    it('renders with table change heading', () => {
      const head = screen.getByText(/Change/)
      expect(head).toBeInTheDocument()
    })

    it('render the checkbox', () => {
      const label = screen.getByText(
        'Hide commits without uploaded coverage (3)'
      )
      expect(label).toBeInTheDocument()
    })

    it('has false as initial value to the checkbox', () => {
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.value).toEqual('false')
    })
  })

  describe('when click on the checkbox', () => {
    beforeEach(() => {
      setup()
      userEvent.click(screen.getByRole('checkbox'))
    })

    it('changes the value to true', () => {
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox.value).toEqual('true')
    })
  })
})
