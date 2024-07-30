import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import GitHubActions from './GitHubActions'

jest.mock('shared/featureFlags')
const mockedUseFlags = useFlags as jest.Mock<{
  newRepoFlag: boolean
}>

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
    mockedUseFlags.mockReturnValue({
      newRepoFlag: hasOrgUploadToken,
    })

    const mockMetricMutationVariables = jest.fn()
    const mockGetItem = jest.spyOn(window.localStorage.__proto__, 'getItem')
    mockGetItem.mockReturnValue(null)

    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockGetRepo))
      ),
      graphql.query('GetOrgUploadToken', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockGetOrgUploadToken))
      }),
      graphql.mutation('storeEventMetric', (req, res, ctx) => {
        mockMetricMutationVariables(req?.variables)
        return res(ctx.status(200), ctx.data({ storeEventMetric: null }))
      })
    )
    return { mockMetricMutationVariables }
  }

  describe('step one', () => {
    it('renders header', async () => {
      setup({})
      render(<GitHubActions />, { wrapper })

      const header = await screen.findByRole('heading', { name: /Step 1/ })
      expect(header).toBeInTheDocument()

      const repositorySecretLink = await screen.findByRole('link', {
        name: /repository secret/,
      })
      expect(repositorySecretLink).toBeInTheDocument()
      expect(repositorySecretLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/cool-repo/settings/secrets/actions/new'
      )
    })

    it('renders body', async () => {
      setup({})
      render(<GitHubActions />, { wrapper })

      const body = await screen.findByText(
        /Admin required to access repo settings > secrets and variable > actions/
      )
      expect(body).toBeInTheDocument()
    })

    it('renders token key box', async () => {
      setup({})
      render(<GitHubActions />, { wrapper })

      const tokenKey = await screen.findByTestId('token-key')
      expect(tokenKey).toBeInTheDocument()
    })

    describe('when org upload token exists', () => {
      it('renders global token copy', async () => {
        setup({ hasOrgUploadToken: true })
        render(<GitHubActions />, { wrapper })

        const globalToken = await screen.findByText(/global token/)
        expect(globalToken).toBeInTheDocument()
      })

      it('renders org token', async () => {
        setup({ hasOrgUploadToken: true })
        render(<GitHubActions />, { wrapper })

        const tokenValue = await screen.findByText('org-token-asdf-1234')
        expect(tokenValue).toBeInTheDocument()
      })
    })

    describe('when org upload token does not exist', () => {
      it('renders repo token copy', async () => {
        setup({})
        render(<GitHubActions />, { wrapper })

        const globalToken = await screen.findByText(/repository token/)
        expect(globalToken).toBeInTheDocument()
      })

      it('renders token box', async () => {
        setup({})
        render(<GitHubActions />, { wrapper })

        const tokenValue = await screen.findByText('repo-token-jkl;-7890')
        expect(tokenValue).toBeInTheDocument()
      })
    })
  })

  describe('step two', () => {
    it('renders header', async () => {
      setup({})
      render(<GitHubActions />, { wrapper })

      const header = await screen.findByRole('heading', { name: /Step 2/ })
      expect(header).toBeInTheDocument()

      const GitHubActionsWorkflowLink = await screen.findByRole('link', {
        name: /GitHub Actions workflow/,
      })
      expect(GitHubActionsWorkflowLink).toBeInTheDocument()
      expect(GitHubActionsWorkflowLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/cool-repo/tree/main/.github/workflows'
      )
    })

    it('renders yaml section', async () => {
      setup({})
      render(<GitHubActions />, { wrapper })

      const yamlBox = await screen.findByText(
        /Upload coverage reports to Codecov/
      )
      expect(yamlBox).toBeInTheDocument()
    })

    it('renders the correct ci version', async () => {
      setup({})
      render(<GitHubActions />, { wrapper })

      const version = await screen.findByText(/v4.0.1/)
      expect(version).toBeInTheDocument()
    })

    describe('if using repo token', () => {
      it('does not show repo slug in yaml', async () => {
        setup({ hasOrgUploadToken: true })
        render(<GitHubActions />, { wrapper })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const slug = screen.queryByText(/slug: codecov\/cool-repo/)
        expect(slug).not.toBeInTheDocument()
      })
    })

    describe('if using org token', () => {
      it('shows repo slug in yaml', async () => {
        setup({ hasOrgUploadToken: true })
        render(<GitHubActions />, { wrapper })

        const slug = await screen.findByText(/slug: codecov\/cool-repo/)
        expect(slug).toBeInTheDocument()
      })
    })

    it('renders example blurb', async () => {
      setup({})
      render(<GitHubActions />, { wrapper })

      const blurb = await screen.findByTestId('example-blurb')
      expect(blurb).toBeInTheDocument()
    })
  })

  describe('step three', () => {
    beforeEach(() => setup({}))
    it('renders body', async () => {
      render(<GitHubActions />, { wrapper })

      const body = await screen.findByText(
        /Once merged to your default branch,/
      )
      expect(body).toBeInTheDocument()
    })
  })

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
      expect(copyCommands.length).toEqual(3)

      await user.click(copyCommands[1] as HTMLElement)

      await user.click(copyCommands[2] as HTMLElement)
      await waitFor(() =>
        expect(mockMetricMutationVariables).toHaveBeenCalledTimes(2)
      )
    })
  })
})
