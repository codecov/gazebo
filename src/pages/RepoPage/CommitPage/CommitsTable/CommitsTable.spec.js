import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from 'react-query'
import CommitsTable from '.'

jest.mock('services/commits/hooks')

describe('CommitsTable', () => {
  function setup({ commits }) {
    const queryClient = new QueryClient()

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <CommitsTable commits={commits} />
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        commits: [
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
    })

    it('renders commit table Name header', () => {
      const name = screen.getByText('Name')
      expect(name).toBeInTheDocument()
    })

    it('renders commit table Change header', () => {
      const change = screen.getByText('Change')
      expect(change).toBeInTheDocument()
    })

    it('renders commit table Patch header', () => {
      const patch = screen.getByText('Patch')
      expect(patch).toBeInTheDocument()
    })

    it('renders commit table Coverage header', () => {
      const coverage = screen.getByText('Coverage')
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('when rendered with no commits', () => {
    beforeEach(() => {
      setup({
        commits: [],
      })
    })

    it('renders no result found message', () => {
      const text = screen.getByText('no results found')
      expect(text).toBeInTheDocument()
    })
  })
})
