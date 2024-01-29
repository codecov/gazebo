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

const mockCommitPageData = ({ resultType }: SetupArgs) => {
  if (resultType === ComparisonReturnType.FIRST_PULL_REQUEST) {
    return {
      owner: {
        isCurrentUserPartOfOrg: true,
        repository: {
          __typename: 'Repository',
          coverageEnabled: true,
          bundleAnalysisEnabled: true,
          commit: {
            commitid: 'ea27be50cd9897d0eb648dc4071a94eabbca1e93',
            compareWithParent: {
              __typename: resultType,
            },
            bundleAnalysisCompareWithParent: {
              __typename: 'BundleAnalysisComparison',
            },
          },
        },
      },
    }
  }

  return {
    owner: {
      isCurrentUserPartOfOrg: true,
      repository: {
        __typename: 'Repository',
        coverageEnabled: true,
        bundleAnalysisEnabled: true,
        commit: {
          commitid: 'ea27be50cd9897d0eb648dc4071a94eabbca1e93',
          compareWithParent: {
            __typename: resultType,
          },
          bundleAnalysisCompareWithParent: {
            __typename: 'BundleAnalysisComparison',
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
      graphql.query('CommitPageData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockCommitPageData({ resultType })))
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
