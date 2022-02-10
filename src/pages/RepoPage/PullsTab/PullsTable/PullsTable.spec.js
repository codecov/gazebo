import { render, screen } from '@testing-library/react'
import { Route, MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from 'react-query'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

import PullsTable from '.'

jest.mock('services/repo/hooks')

describe('Pulls Table', () => {
  function setup({ modifiedProps = {}, overridePulls = {} }) {
    const defaultPull = {
      author: { username: 'RulaKhaled' },
      compareWithBase: {
        changeWithParent: 14
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
    }

    const props = {
      pulls: [
        {
          node: {
            ...defaultPull,
            ...modifiedProps,
          },
        },
      ],
      ...overridePulls,
    }

    const queryClient = new QueryClient()

    render(
      <MemoryRouter initialEntries={['/gh/codecov/Test/pulls']}>
        <Route path="/:provider/:owner/:repo/pulls">
          <QueryClientProvider client={queryClient}>
            <PullsTable {...props} />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with the full/correct available pulls data', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders pulls titles', () => {
      const title1 = screen.getByText(/Test1/)
      expect(title1).toBeInTheDocument()
    })

    it('renders pulls authors', () => {
      const author1 = screen.getByText(/RulaKhaled/)
      expect(author1).toBeInTheDocument()
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
    })

    it('renders pulls covarage', () => {
      const cov1 = screen.getByText(/45.00%/)
      expect(cov1).toBeInTheDocument()
    })

    it('renders pulls change from base', () => {
      const changeValue = screen.getByTestId('change-value')
      expect(changeValue).toHaveTextContent("14.00%")
    })
  })

  describe('when rendered with a no pulls data', () => {
    beforeEach(() => {
      setup({
        overridePulls: { pulls: [] },
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
        overridePulls: { pulls: [null] },
      })
    })

    it('renders missing pulls message', () => {
      const msg = screen.getByText(/we can't find this pull/)
      expect(msg).toBeInTheDocument()
    })
  })

  describe('when pull rendered with null coverage', () => {
    beforeEach(() => {
      setup({
        modifiedProps: {
          compareWithBase: {
            patchTotals: {
              coverage: null,
            },
          },
          head: {
            totals: {
              coverage: null,
            },
          },
        },
      })
    })

    it('renders text of null covergae', () => {
      const msg = screen.getByText(/No report uploaded yet/)
      expect(msg).toBeInTheDocument()
    })

    it('renders id of the pull', () => {
      const id = screen.getByText(/#746/)
      expect(id).toBeInTheDocument()
    })
  })

  describe('when pull rendered with CLOSE state', () => {
    beforeEach(() => {
      setup({
        modifiedProps: { state: 'CLOSED' },
      })
    })

    it('renders the icon pullRequestClosed', () => {
      const icon = screen.getByText(/pull-request-closed.svg/)
      expect(icon).toBeInTheDocument()
    })
  })

  describe('when pull rendered with MERGED state', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders the icon merge', () => {
      const icon = screen.getByText(/merge.svg/)
      expect(icon).toBeInTheDocument()
    })
  })

  describe('when pull rendered with OPEN state', () => {
    beforeEach(() => {
      setup({
        modifiedProps: { state: 'OPEN' },
      })
    })

    it('renders the icon pullRequestOpen', () => {
      const icon = screen.getByText(/pull-request-open.svg/)
      expect(icon).toBeInTheDocument()
    })
  })

  describe('when pull rendered with no head covarge', () => {
    beforeEach(() => {
      setup({
        modifiedProps: {
          head: {
            totals: null,
          },
        },
      })
    })

    it('does not render the change', () => {
      const change = screen.queryByText(/90/)
      expect(change).not.toBeInTheDocument()
    })
  })
})
