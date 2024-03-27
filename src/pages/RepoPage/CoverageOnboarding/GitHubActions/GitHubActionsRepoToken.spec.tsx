import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import GitHubActionsRepoToken from './GitHubActionsRepoToken'

const mockGetRepo = {
  owner: {
    isCurrentUserPartOfOrg: true,
    orgUploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629290',
    isAdmin: null,
    isCurrentUserActivated: null,
    repository: {
      __typename: 'Repository',
      private: false,
      uploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
      active: true,
    },
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

describe('GitHubActions', () => {
  function setup() {
    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockGetRepo))
      )
    )
  }

  describe('intro blurb', () => {
    beforeEach(() => setup())

    it('renders intro blurb', async () => {
      render(<GitHubActionsRepoToken />, { wrapper })

      const blurb = await screen.findByTestId('intro-blurb')
      expect(blurb).toBeInTheDocument()
    })
  })

  describe('step one', () => {
    beforeEach(() => setup())

    it('renders header', async () => {
      render(<GitHubActionsRepoToken />, { wrapper })

      const header = await screen.findByRole('heading', { name: /Step 1/ })
      expect(header).toBeInTheDocument()

      const repositorySecretLink = await screen.findByRole('link', {
        name: /repository secret/,
      })
      expect(repositorySecretLink).toBeInTheDocument()
      expect(repositorySecretLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/cool-repo/settings/secrets/actions'
      )
    })

    it('renders body', async () => {
      render(<GitHubActionsRepoToken />, { wrapper })

      const body = await screen.findByText(
        /Admin required to access repo settings > secrets and variable > actions/
      )
      expect(body).toBeInTheDocument()
    })

    it('renders token box', async () => {
      render(<GitHubActionsRepoToken />, { wrapper })

      const codecovToken = await screen.findByText(/CODECOV_TOKEN=/)
      expect(codecovToken).toBeInTheDocument()

      const tokenValue = await screen.findByText(
        /9e6a6189-20f1-482d-ab62-ecfaa2629295/
      )
      expect(tokenValue).toBeInTheDocument()
    })
  })

  describe('step two', () => {
    beforeEach(() => setup())

    it('renders header', async () => {
      render(<GitHubActionsRepoToken />, { wrapper })

      const header = await screen.findByRole('heading', { name: /Step 2/ })
      expect(header).toBeInTheDocument()

      const GitHubActionsRepoTokenWorkflowLink = await screen.findByRole(
        'link',
        {
          name: /GitHub Actions workflow/,
        }
      )
      expect(GitHubActionsRepoTokenWorkflowLink).toBeInTheDocument()
      expect(GitHubActionsRepoTokenWorkflowLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/cool-repo/tree/main/.github/workflows'
      )
    })

    it('renders yaml section', async () => {
      render(<GitHubActionsRepoToken />, { wrapper })

      const yamlBox = await screen.findByText(
        /Upload coverage reports to Codecov/
      )
      expect(yamlBox).toBeInTheDocument()
    })

    it('renders example blurb', async () => {
      render(<GitHubActionsRepoToken />, { wrapper })

      const blurb = await screen.findByTestId('example-blurb')
      expect(blurb).toBeInTheDocument()
    })
  })

  describe('step three', () => {
    beforeEach(() => setup())
    it('renders first body', async () => {
      render(<GitHubActionsRepoToken />, { wrapper })

      const body = await screen.findByText(/After you committed your changes/)
      expect(body).toBeInTheDocument()
    })

    it('renders second body', async () => {
      render(<GitHubActionsRepoToken />, { wrapper })

      const body = await screen.findByText(/Once merged to the/)
      expect(body).toBeInTheDocument()
    })

    it('renders status check image', async () => {
      render(<GitHubActionsRepoToken />, { wrapper })

      const img = await screen.findByRole('img', {
        name: 'codecov patch and project',
      })
      expect(img).toBeInTheDocument()
    })
  })

  describe('ending', () => {
    beforeEach(() => setup())
    it('renders body', async () => {
      render(<GitHubActionsRepoToken />, { wrapper })

      const body = await screen.findByText(/How was your setup experience/)
      expect(body).toBeInTheDocument()

      const bodyLink = await screen.findByRole('link', { name: /this issue/ })
      expect(bodyLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/Codecov-user-feedback/issues/18'
      )
    })
  })
})
