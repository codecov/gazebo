import { render, screen } from '@testing-library/react'
import { Route, MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from 'react-query'
import PullsTable from '.'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

jest.mock('services/repo/hooks')

describe('Pulls Table', () => {
  function setup({ pulls }) {
    const queryClient = new QueryClient()

    render(
      <MemoryRouter initialEntries={['/gh/codecov/Test/pulls']}>
        <Route path="/:provider/:owner/:repo/pulls">
          <QueryClientProvider client={queryClient}>
            <PullsTable pulls={pulls} />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with the full/correct available pulls data', () => {
    beforeEach(() => {
      setup({
        pulls: [
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
              state: 'OPENED',
              title: 'Test2',
              updatestamp: '2021-07-30T19:33:49.819672',
            },
          },
        ],
      })
    })

    it('renders pulls titles', () => {
      const title1 = screen.getByText(/Test1/)
      expect(title1).toBeInTheDocument()
      const title2 = screen.getByText(/Test2/)
      expect(title2).toBeInTheDocument()
    })

    it('renders pulls authors', () => {
      const author1 = screen.getByText(/RulaKhaled/)
      expect(author1).toBeInTheDocument()
      const author2 = screen.getByText(/ThiagoCodecov/)
      expect(author2).toBeInTheDocument()
    })

    it('renders pulls updatestamp', () => {
      const dt = formatDistanceToNow(new Date('2021-08-30T19:33:49.819672'), {
        addSuffix: true,
      })
      const dt1 = screen.getByText('opened ' + dt)
      expect(dt1).toBeInTheDocument()
    })

    it('renders pulls ids', () => {
      const id1 = screen.getByText(/#746/)
      expect(id1).toBeInTheDocument()
      const id2 = screen.getByText(/#745/)
      expect(id2).toBeInTheDocument()
    })

    it('renders pulls covarage', () => {
      const cov1 = screen.getByText(/45.00%/)
      expect(cov1).toBeInTheDocument()
      const cov2 = screen.getByText(/100.00%/)
      expect(cov2).toBeInTheDocument()
    })

    it('renders pulls change from base', () => {
      const res1 = 45 - 90
      const change1 = screen.getByText(res1 + '%')
      expect(change1).toBeInTheDocument()
      const res2 = 100 - 87
      const change2 = screen.getByText(res2 + '%')
      expect(change2).toBeInTheDocument()
    })
  })

  describe('when rendered with a no pulls data', () => {
    beforeEach(() => {
      setup({
        pulls: [],
      })
    })

    it('renders no pulls message', () => {
      const msg = screen.getByText(/no results found/)
      expect(msg).toBeInTheDocument()
    })
  })

  describe('when rendered with missing pulls data', () => {
    beforeEach(() => {
      setup({
        pulls: [null],
      })
    })

    it('renders missing pulls message', () => {
      const msg = screen.getByText(/we can't find this pull/)
      expect(msg).toBeInTheDocument()
    })
  })
})
