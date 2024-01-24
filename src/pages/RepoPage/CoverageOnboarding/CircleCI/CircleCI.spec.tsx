import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import CircleCI from './CircleCI'

jest.mock('./CircleCIRepoToken', () => () => 'CircleCIRepoToken')
jest.mock('./CircleCIOrgToken', () => () => 'CircleCIOrgToken')
jest.mock('shared/featureFlags')

const mockedNewRepoFlag = useFlags as jest.Mock<{ newRepoFlag: boolean }>

const mockGetRepo = (hasOrgUploadToken: boolean | null) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    orgUploadToken: hasOrgUploadToken
      ? '9e6a6189-20f1-482d-ab62-ecfaa2629290'
      : null,
    repository: {
      private: false,
      uploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
    },
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

describe('CircleCI', () => {
  function setup(hasOrgUploadToken: boolean | null) {
    mockedNewRepoFlag.mockReturnValue({ newRepoFlag: true })

    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockGetRepo(hasOrgUploadToken)))
      )
    )
  }

  describe('when org upload token is available', () => {
    beforeEach(() => {
      setup(true)
    })

    it('renders CircleCIOrgToken', async () => {
      render(<CircleCI />, { wrapper })

      const CircleCIOrgToken = await screen.findByText('CircleCIOrgToken')
      expect(CircleCIOrgToken).toBeInTheDocument()
    })
  })

  describe('when org upload token is not available', () => {
    beforeEach(() => {
      setup(false)
    })

    it('renders CircleCIRepoToken', async () => {
      render(<CircleCI />, { wrapper })

      const CircleCIRepoToken = await screen.findByText('CircleCIRepoToken')
      expect(CircleCIRepoToken).toBeInTheDocument()
    })
  })
})
