import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { useIntersection } from 'react-use'

import config from 'config'

import Badges from './Badges'

jest.mock('config')
jest.mock('react-use/lib/useIntersection')
const mockedUseIntersection = useIntersection as jest.Mock

const mockNoBranches = {
  __typename: 'Repository',
  branches: {
    edges: [],
    pageInfo: {
      hasNextPage: false,
      endCursor: null,
    },
  },
}

const mockBranches = (hasNextPage = false) => ({
  __typename: 'Repository',
  branches: {
    edges: [
      {
        node: {
          name: 'branch-1',
          head: {
            commitid: 'asdf123',
          },
        },
      },
      {
        node: {
          name: 'branch-2',
          head: {
            commitid: 'asdf123',
          },
        },
      },
      {
        node: {
          name: 'branch-3',
          head: {
            commitid: 'asdf123',
          },
        },
      },
    ],
    pageInfo: {
      hasNextPage: hasNextPage,
      endCursor: 'end-cursor',
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={['/gh/codecov/codecov-client/settings/badge']}
    >
      <Route path="/:provider/:owner/:repo/settings/badge">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

beforeAll(() => {
  jest.clearAllMocks()
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

type SetupArgs = {
  noBranches?: boolean
  hasNextPage?: boolean
  fetchNextPage?: () => void
  mockSearching?: (value: string) => void
}

describe('Badges', () => {
  function setup({
    noBranches = false,
    hasNextPage = false,
    fetchNextPage = () => {},
    mockSearching = (value: string) => {},
  }: SetupArgs) {
    config.BASE_URL = 'https://stage-web.codecov.dev'
    server.use(
      graphql.query('GetBranches', (req, res, ctx) => {
        if (req.variables?.after) {
          fetchNextPage()
        }

        if (req.variables?.filters?.searchValue) {
          mockSearching(req.variables?.filters?.searchValue)
        }

        if (noBranches) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: { repository: mockNoBranches },
            })
          )
        }

        return res(
          ctx.status(200),
          ctx.data({
            owner: { repository: mockBranches(hasNextPage) },
          })
        )
      })
    )

    return userEvent.setup()
  }

  describe('renders', () => {
    it('renders title', () => {
      setup({})
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const title = screen.getByText(/Codecov badge/)
      expect(title).toBeInTheDocument()
    })

    it('renders body', () => {
      setup({})
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const p = screen.getByText(
        /A live icon that you can embed in code, such as in a README.md, to provide quick insight into your project's code coverage percentage./
      )
      expect(p).toBeInTheDocument()
    })

    it('renders with expected base url', () => {
      setup({})
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const baseUrl = screen.getByText(
        '[![codecov](https://stage-web.codecov.dev/gh/codecov/codecov-client/graph/badge.svg?token=WIO9JXFGE)](https://stage-web.codecov.dev/gh/codecov/codecov-client)'
      )
      expect(baseUrl).toBeInTheDocument()
    })

    it('renders tokens', () => {
      setup({})
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      expect(screen.getByText('Markdown')).toBeInTheDocument()
      expect(screen.getByText('HTML')).toBeInTheDocument()
      expect(screen.getByText('RST')).toBeInTheDocument()
    })
  })

  describe('branch selector', () => {
    it('renders proper url with Default branch selected', async () => {
      setup({})
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const baseUrl = screen.getByText(
        '[![codecov](https://stage-web.codecov.dev/gh/codecov/codecov-client/graph/badge.svg?token=WIO9JXFGE)](https://stage-web.codecov.dev/gh/codecov/codecov-client)'
      )
      expect(baseUrl).toBeInTheDocument()
    })

    it('renders proper url with non-default branch selected', async () => {
      const user = setup({})
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      user.click(button)

      const branch = await screen.findByText('branch-2')
      user.click(branch)

      await waitForElementToBeRemoved(branch)

      const baseUrl = await screen.findByText(
        '[![codecov](https://stage-web.codecov.dev/gh/codecov/codecov-client/branch/branch-2/graph/badge.svg?token=WIO9JXFGE)](https://stage-web.codecov.dev/gh/codecov/codecov-client)'
      )
      expect(baseUrl).toBeInTheDocument()
    })

    it('renders loading state', async () => {
      const user = setup({ noBranches: true })
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      user.click(button)

      const loading = await screen.findByText('Loading more items...')
      expect(loading).toBeInTheDocument()
    })

    it('renders Default branch as option even if no branches present', async () => {
      const user = setup({ noBranches: true })
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      user.click(button)

      await waitFor(() =>
        expect(screen.queryAllByText('Default branch')).toHaveLength(2)
      )
    })

    it('tries to load more', async () => {
      mockedUseIntersection.mockReturnValue({ isIntersecting: true })
      const fetchNextPage = jest.fn()
      const user = setup({ hasNextPage: true, fetchNextPage })
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      user.click(button)

      expect(await screen.findByText('Search')).toBeInTheDocument()

      await waitFor(() => expect(fetchNextPage).toHaveBeenCalled())
    })

    it('handles searching', async () => {
      const fetchNextPage = jest.fn()
      const mockSearching = jest.fn()
      const user = setup({ hasNextPage: true, fetchNextPage, mockSearching })
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      user.click(button)

      expect(await screen.findByText('Search')).toBeInTheDocument()

      const searchField = await screen.findByPlaceholderText('Search')
      await user.type(searchField, 'branch-3')

      await waitFor(() =>
        expect(mockSearching).toHaveBeenCalledWith('branch-3')
      )
    })
  })
})
