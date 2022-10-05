import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import CommitsTable from './CommitsTable'

jest.mock('services/commits')

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
            author: { username: 'RulaKhaled', avatarUrl: 'random' },
            compareWithParent: {
              patchTotals: {
                coverage: 90,
              },
            },
            totals: {
              coverage: 45,
            },
            parent: {
              totals: {
                coverage: 98,
              },
            },
            commitid: 'id',
            message: 'Test1',
            createdAt: '2021-08-30T19:33:49.819672',
          },
          {
            author: { username: 'Terry', avatarUrl: 'random' },
            compareWithParent: {
              patchTotals: {
                coverage: 55,
              },
            },
            totals: {
              coverage: 59,
            },
            parent: {
              totals: {
                coverage: 98,
              },
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
      const patch = screen.getByText('Patch %')
      expect(patch).toBeInTheDocument()
    })

    it('renders commit table Coverage header', () => {
      const coverage = screen.getByText('Coverage')
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('when rendered with no commits (length)', () => {
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

  describe('when rendered with no commits', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders no result found message', () => {
      const text = screen.getByText('no results found')
      expect(text).toBeInTheDocument()
    })
  })

  describe('when rendered with null commit', () => {
    beforeEach(() => {
      setup({
        commits: [null],
      })
    })

    it('renders on null message', () => {
      const text = screen.getByText(/we can't find this commit/)
      expect(text).toBeInTheDocument()
    })
  })

  describe('when rendered with an invalid patch value', () => {
    beforeEach(() => {
      setup({
        commits: [
          {
            author: { username: 'RabeeAbuBaker', avatarUrl: 'random' },
            compareWithParent: {
              patchTotals: {
                coverage: null,
              },
            },
            totals: {
              coverage: 45,
            },
            parent: {
              totals: {
                coverage: 98,
              },
            },
            commitid: 'id',
            message: 'Test1',
            createdAt: '2021-08-30T19:33:49.819672',
          },
        ],
      })
    })

    it('render - for missing patch', () => {
      const changeValue = screen.getByTestId('patch-value')
      expect(changeValue).toHaveTextContent('-')
    })
  })
})
