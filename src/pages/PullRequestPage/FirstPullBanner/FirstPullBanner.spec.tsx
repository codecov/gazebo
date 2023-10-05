import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { ComparisonReturnType } from 'shared/utils/comparison'

import FirstPullBanner from './FirstPullBanner'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/12']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

interface SetupArgs {
  resultType: string
}

const mockPullData = ({ resultType }: SetupArgs) => {
  if (resultType === ComparisonReturnType.FIRST_PULL_REQUEST) {
    return {
      owner: {
        repository: {
          __typename: 'Repository',
          pull: {
            pullId: 1,
            head: {
              commitid: '123',
            },
            compareWithBase: {
              __typename: resultType,
              message: resultType,
            },
          },
        },
      },
    }
  }

  return {
    owner: {
      repository: {
        __typename: 'Repository',
        pull: {
          pullId: 1,
          head: {
            commitid: '123',
          },
          compareWithBase: {
            __typename: resultType,
            impactedFilesCount: 2,
            indirectChangedFilesCount: 3,
            directChangedFilesCount: 4,
            flagComparisonsCount: 5,
            componentComparisonsCount: 6,
          },
        },
      },
    },
  }
}

describe('FirstPullBanner', () => {
  function setup(
    { resultType }: SetupArgs = {
      resultType: ComparisonReturnType.FIRST_PULL_REQUEST,
    }
  ) {
    server.use(
      graphql.query('PullPageData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockPullData({ resultType })))
      )
    )
  }

  describe('When render with first pull request result', () => {
    it('should render heading', async () => {
      setup()
      render(<FirstPullBanner />, { wrapper })

      const header = await screen.findByRole('heading', {
        name: /Welcome to Codecov/,
      })
      expect(header).toBeInTheDocument()
    })

    it('should render content', async () => {
      setup()
      render(<FirstPullBanner />, { wrapper })

      const content = await screen.findByText(
        /Once merged to your default branch/
      )
      expect(content).toBeInTheDocument()
    })
  })

  describe('When render with other result types', () => {
    it('should not render', () => {
      setup({ resultType: ComparisonReturnType.SUCCESSFUL_COMPARISON })

      const { container } = render(<FirstPullBanner />, { wrapper })
      expect(container).toBeEmptyDOMElement()
    })
  })
})
