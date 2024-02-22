import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import GitHubActionsOrgToken from './GitHubActionsOrgToken'

const mockGetRepo = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      private: false,
      uploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
    },
  },
}

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

describe('GitHubActionsOrgToken', () => {
  function setup(hasOrgUploadToken: boolean | null) {
    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockGetRepo))
      ),
      graphql.query('GetOrgUploadToken', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(mockGetOrgUploadToken(hasOrgUploadToken))
        )
      })
    )
  }

  describe('intro blurb', () => {
    beforeEach(() => setup(true))

    it('renders intro blurb', async () => {
      render(<GitHubActionsOrgToken />, { wrapper })

      const blurb = await screen.findByTestId('intro-blurb')
      expect(blurb).toBeInTheDocument()
    })
  })

  describe('step one', () => {
    describe('when org upload token exists', () => {
      beforeEach(() => setup(true))

      it('renders header', async () => {
        render(<GitHubActionsOrgToken />, { wrapper })

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
        render(<GitHubActionsOrgToken />, { wrapper })

        const body = await screen.findByText(
          /Admin required to access repo settings > secrets and variable > actions/
        )
        expect(body).toBeInTheDocument()
      })

      it('renders token box', async () => {
        render(<GitHubActionsOrgToken />, { wrapper })

        const codecovToken = await screen.findByText(/CODECOV_TOKEN=/)
        expect(codecovToken).toBeInTheDocument()

        const tokenValue = await screen.findByText(
          /9e6a6189-20f1-482d-ab62-ecfaa2629290/
        )
        expect(tokenValue).toBeInTheDocument()
      })

      it('renders global token copy', async () => {
        render(<GitHubActionsOrgToken />, { wrapper })

        const globalToken = await screen.findByText(/global token/)
        expect(globalToken).toBeInTheDocument()
      })
    })

    describe('when org upload token does not exist', () => {
      beforeEach(() => setup(false))

      it('renders header', async () => {
        render(<GitHubActionsOrgToken />, { wrapper })

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
        render(<GitHubActionsOrgToken />, { wrapper })

        const body = await screen.findByText(
          /Admin required to access repo settings > secrets and variable > actions/
        )
        expect(body).toBeInTheDocument()
      })

      it('renders token box', async () => {
        render(<GitHubActionsOrgToken />, { wrapper })

        const codecovToken = await screen.findByText(/CODECOV_TOKEN=/)
        expect(codecovToken).toBeInTheDocument()

        const tokenValue = await screen.findByText(
          /9e6a6189-20f1-482d-ab62-ecfaa2629295/
        )
        expect(tokenValue).toBeInTheDocument()
      })

      it('renders repo token copy', async () => {
        render(<GitHubActionsOrgToken />, { wrapper })

        const globalToken = await screen.findByText(/repository token/)
        expect(globalToken).toBeInTheDocument()
      })
    })
  })

  describe('step two', () => {
    beforeEach(() => setup(true))

    it('renders header', async () => {
      render(<GitHubActionsOrgToken />, { wrapper })

      const header = await screen.findByRole('heading', { name: /Step 2/ })
      expect(header).toBeInTheDocument()

      const GitHubActionsOrgTokenWorkflowLink = await screen.findByRole(
        'link',
        {
          name: /GitHub Actions workflow/,
        }
      )
      expect(GitHubActionsOrgTokenWorkflowLink).toBeInTheDocument()
      expect(GitHubActionsOrgTokenWorkflowLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/cool-repo/tree/main/.github/workflows'
      )
    })

    it('renders yaml section', async () => {
      render(<GitHubActionsOrgToken />, { wrapper })

      const yamlBox = await screen.findByText(
        /Upload coverage reports to Codecov/
      )
      expect(yamlBox).toBeInTheDocument()
    })

    it('renders the correct ci version', async () => {
      render(<GitHubActionsOrgToken />, { wrapper })

      const version = await screen.findByText(/v4.0.1/)
      expect(version).toBeInTheDocument()
    })
  })

  describe('step three', () => {
    beforeEach(() => setup(true))
    it('renders first body', async () => {
      render(<GitHubActionsOrgToken />, { wrapper })

      const body = await screen.findByText(/After you committed your changes/)
      expect(body).toBeInTheDocument()
    })

    it('renders second body', async () => {
      render(<GitHubActionsOrgToken />, { wrapper })

      const body = await screen.findByText(/Once merged to the/)
      expect(body).toBeInTheDocument()
    })

    it('renders status check image', async () => {
      render(<GitHubActionsOrgToken />, { wrapper })

      const img = await screen.findByRole('img', {
        name: 'codecov patch and project',
      })
      expect(img).toBeInTheDocument()
    })
  })

  describe('ending', () => {
    beforeEach(() => setup(true))
    it('renders quick start link', async () => {
      render(<GitHubActionsOrgToken />, { wrapper })

      const link = await screen.findByRole('link', { name: /learn more/ })
      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/quick-start'
      )
    })
    it('renders body', async () => {
      render(<GitHubActionsOrgToken />, { wrapper })

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
