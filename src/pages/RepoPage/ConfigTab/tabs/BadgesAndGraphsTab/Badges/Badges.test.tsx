import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Badges from './Badges'

const mocks = vi.hoisted(() => ({
  useIntersection: vi.fn().mockReturnValue({ isIntersecting: false }),
}))

vi.mock('config')
vi.mock('react-use', async () => {
  const actual = await vi.importActual('react-use')
  return {
    ...actual,
    useIntersection: mocks.useIntersection,
  }
})

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
          head: { commitid: 'asdf123' },
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
    <MemoryRouter initialEntries={['/gh/codecov/codecov-client/config/badge']}>
      <Route path="/:provider/:owner/:repo/config/badge">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => {
  server.close()
})

type SetupArgs = {
  noBranches?: boolean
  hasNextPage?: boolean
}

describe('Badges', () => {
  function setup({ noBranches = false, hasNextPage = false }: SetupArgs) {
    const fetchNextPage = vi.fn()
    const mockSearching = vi.fn()
    config.BASE_URL = 'https://stage-web.codecov.dev'
    server.use(
      graphql.query('GetBranches', (info) => {
        if (info.variables?.after) {
          fetchNextPage(info.variables?.after)
        }

        if (info.variables?.filters?.searchValue) {
          mockSearching(info.variables?.filters?.searchValue)
        }

        if (noBranches) {
          return HttpResponse.json({
            data: {
              owner: { repository: mockNoBranches },
            },
          })
        }

        return HttpResponse.json({
          data: {
            owner: { repository: mockBranches(hasNextPage) },
          },
        })
      })
    )

    return { user: userEvent.setup(), fetchNextPage, mockSearching }
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

      const markdown = screen.getByText('Markdown')
      const html = screen.getByText('HTML')
      const rst = screen.getByText('RST')
      expect(markdown).toBeInTheDocument()
      expect(html).toBeInTheDocument()
      expect(rst).toBeInTheDocument()
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
      const { user } = setup({})
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      await user.click(button)

      const branch = await screen.findByText('branch-2')
      await user.click(branch)

      const baseUrl = await screen.findByText(
        '[![codecov](https://stage-web.codecov.dev/gh/codecov/codecov-client/branch/branch-2/graph/badge.svg?token=WIO9JXFGE)](https://stage-web.codecov.dev/gh/codecov/codecov-client)'
      )
      expect(baseUrl).toBeInTheDocument()
    })

    it('renders loading state', async () => {
      const { user } = setup({ noBranches: true })
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      await user.click(button)

      const loading = await screen.findByText('Loading more items...')
      expect(loading).toBeInTheDocument()
    })

    it('renders Default branch as option even if no branches present', async () => {
      const { user } = setup({ noBranches: true })
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      await user.click(button)

      await waitFor(() =>
        expect(screen.queryAllByText('Default branch')).toHaveLength(2)
      )
    })

    it('tries to load more', async () => {
      mocks.useIntersection.mockReturnValue({ isIntersecting: true })
      const { user, fetchNextPage } = setup({ hasNextPage: true })
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      await user.click(button)

      await waitFor(() =>
        expect(fetchNextPage).toHaveBeenCalledWith('end-cursor')
      )
    })

    it('handles searching', async () => {
      const { user, mockSearching } = setup({ hasNextPage: false })
      render(<Badges graphToken="WIO9JXFGE" />, {
        wrapper,
      })

      const button = await screen.findByText('Default branch')
      expect(button).toBeInTheDocument()
      await user.click(button)

      const searchField = await screen.findByPlaceholderText('Search')
      await user.type(searchField, 'branch-3')

      await waitFor(() =>
        expect(mockSearching).toHaveBeenCalledWith('branch-3')
      )
    })
  })
})
