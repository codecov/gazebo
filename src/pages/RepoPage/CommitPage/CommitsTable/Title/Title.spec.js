import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Title from '.'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { QueryClientProvider, QueryClient } from 'react-query'
import { useOwner } from 'services/user'

jest.mock('services/repo/hooks')
jest.mock('services/user/hooks')

describe('Title', () => {
  function setup({ commit }) {
    const queryClient = new QueryClient()

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <Title commit={commit} />
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      useOwner.mockReturnValue({
        data: {
          username: 'RulaKhaled',
          avatarUrl: 'randompic',
          isCurrentUserPartOfOrg: true,
        },
      })
      setup({
        commit: {
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
      })
    })

    it('renders commit title', () => {
      const text = screen.getByText(/Test1/)
      expect(text).toBeInTheDocument()
    })

    it('renders commit author', () => {
      const author1 = screen.getByText(/RulaKhaled/)
      expect(author1).toBeInTheDocument()
    })

    it('renders commit updatestamp', () => {
      const dt = formatDistanceToNow(new Date('2021-08-30T19:33:49.819672'), {
        addSuffix: true,
      })
      const dt1 = screen.getByText('opened ' + dt)
      expect(dt1).toBeInTheDocument()
    })
  })

  describe('when rendered with no owner data', () => {
    beforeEach(() => {
      useOwner.mockReturnValue({
        data: null,
      })
      setup({
        commit: {
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
      })
    })

    it('renders commit title', () => {
      const text = screen.queryByText(/Test1/)
      expect(text).not.toBeInTheDocument()
    })

    it('renders commit author', () => {
      const author1 = screen.queryByText(/RulaKhaled/)
      expect(author1).not.toBeInTheDocument()
    })

    it('renders commit updatestamp', () => {
      const dt = formatDistanceToNow(new Date('2021-08-30T19:33:49.819672'), {
        addSuffix: true,
      })
      const dt1 = screen.queryByText('opened ' + dt)
      expect(dt1).not.toBeInTheDocument()
    })
  })

  describe('when rendered with message longer than 50', () => {
    beforeEach(() => {
      useOwner.mockReturnValue({
        data: {
          username: 'RulaKhaled',
          avatarUrl: 'randompic',
          isCurrentUserPartOfOrg: true,
        },
      })
      setup({
        commit: {
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
          message:
            'Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1Test1',
          createdAt: '2021-08-30T19:33:49.819672',
        },
      })
    })

    it('renders commit title with 3 dots', () => {
      const text = screen.queryByText(
        /Test1Test1Test1Test1Test1Test1Test1Test1.../
      )
      expect(text).toBeInTheDocument()
    })
  })
})
