import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import GitHubActions from './GitHubActions'

jest.mock('./GitHubActionsRepoToken', () => () => 'GitHubActionsRepoToken')
jest.mock('./GitHubActionsOrgToken', () => () => 'GitHubActionsOrgToken')
jest.mock('shared/featureFlags')

const mockedNewRepoFlag = useFlags as jest.Mock<{ newRepoFlag: boolean }>

const mockGetOrgUploadToken = (hasOrgUploadToken: boolean | null) => ({
  owner: {
    orgUploadToken: hasOrgUploadToken
      ? '9e6a6189-20f1-482d-ab62-ecfaa2629290'
      : null,
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/new']}>
      <Route
        path={[
          '/:provider/:owner/:repo/new',
          '/:provider/:owner/:repo/new/other-ci',
        ]}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  console.error = () => {}
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('GitHubActions', () => {
  function setup(hasOrgUploadToken: boolean | null) {
    mockedNewRepoFlag.mockReturnValue({ newRepoFlag: true })

    server.use(
      graphql.query('GetOrgUploadToken', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(mockGetOrgUploadToken(hasOrgUploadToken))
        )
      })
    )
  }

  describe('when org upload token is available', () => {
    beforeEach(() => {
      setup(true)
    })

    it('renders GitHubActionsOrgToken', async () => {
      render(<GitHubActions />, { wrapper })

      const githubActionsOrgToken = await screen.findByText(
        'GitHubActionsOrgToken'
      )
      expect(githubActionsOrgToken).toBeInTheDocument()
    })
  })

  describe('when org upload token is not available', () => {
    beforeEach(() => {
      setup(false)
    })

    it('renders GitHubActionsRepoToken', async () => {
      render(<GitHubActions />, { wrapper })

      const githubActionsRepoToken = await screen.findByText(
        'GitHubActionsRepoToken'
      )
      expect(githubActionsRepoToken).toBeInTheDocument()
    })
  })
})
