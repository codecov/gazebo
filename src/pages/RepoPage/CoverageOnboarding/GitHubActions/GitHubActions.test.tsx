import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import GitHubActions from './GitHubActions'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
}))

vi.mock('shared/featureFlags', async () => {
  const actual = await vi.importActual('shared/featureFlags')
  return {
    ...actual,
    useFlags: mocks.useFlags,
  }
})

const mockGetRepo = {
  owner: {
    isAdmin: null,
    isCurrentUserPartOfOrg: true,
    isCurrentUserActivated: null,
    repository: {
      __typename: 'Repository',
      private: false,
      uploadToken: 'repo-token-jkl;-7890',
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
      active: true,
      isFirstPullRequest: false,
    },
  },
}

const mockGetOrgUploadToken = {
  owner: {
    orgUploadToken: 'org-token-asdf-1234',
  },
}

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

interface SetupArgs {
  hasOrgUploadToken?: boolean
}

describe('GitHubActions', () => {
  function setup({ hasOrgUploadToken = false }: SetupArgs) {
    mocks.useFlags.mockReturnValue({
      newRepoFlag: hasOrgUploadToken,
    })

    const mockMetricMutationVariables = vi.fn()
    const mockGetItem = vi.spyOn(window.localStorage.__proto__, 'getItem')
    mockGetItem.mockReturnValue(null)

    server.use(
      graphql.query('GetRepo', () => {
        return HttpResponse.json({ data: mockGetRepo })
      }),
      graphql.query('GetOrgUploadToken', () => {
        return HttpResponse.json({ data: mockGetOrgUploadToken })
      }),
      graphql.mutation('storeEventMetric', (info) => {
        mockMetricMutationVariables(info?.variables)
        return HttpResponse.json({ data: { storeEventMetric: null } })
      })
    )
    const user = userEvent.setup()

    return { mockMetricMutationVariables, user }
  }

  describe('feedback CTA', () => {
    beforeEach(() => setup({}))
    it('renders body', async () => {
      render(<GitHubActions />, { wrapper })

      const body = await screen.findByText(/How was your setup experience/)
      expect(body).toBeInTheDocument()

      const bodyLink = await screen.findByRole('link', { name: /this issue/ })
      expect(bodyLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/Codecov-user-feedback/issues/18'
      )
    })
  })

  describe('learn more blurb', () => {
    it('renders body', async () => {
      setup({})
      render(<GitHubActions />, { wrapper })

      const body = await screen.findByText(/Visit our guide to/)
      expect(body).toBeInTheDocument()

      const link = await screen.findByRole('link', { name: /learn more/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/quick-start'
      )
    })
  })

  describe('user copies text', () => {
    it('stores codecov metric', async () => {
      const { mockMetricMutationVariables } = setup({})
      const user = userEvent.setup()
      render(<GitHubActions />, { wrapper })

      const copyCommands = await screen.findAllByTestId(
        'clipboard-code-snippet'
      )

      expect(copyCommands.length).toEqual(5)

      const promises: Promise<void>[] = []
      copyCommands.forEach((copy) => promises.push(user.click(copy)))
      await Promise.all(promises)

      // One of the code-snippets does not have a metric associated with it
      expect(mockMetricMutationVariables).toHaveBeenCalledTimes(4)
    })
  })
})
