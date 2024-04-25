import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import CircleCI from './CircleCI'

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
          '/:provider/:owner/:repo/new/circle-ci',
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

describe('CircleCI', () => {
  function setup({ hasOrgUploadToken = false }: SetupArgs) {
    mockedUseFlags.mockReturnValue({
      newRepoFlag: hasOrgUploadToken,
    })
    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockGetRepo))
      ),
      graphql.query('GetOrgUploadToken', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockGetOrgUploadToken))
      })
    )
  }

  describe('step one', () => {
    it('renders header', async () => {
      setup({})
      render(<CircleCI />, { wrapper })

      const header = await screen.findByRole('heading', { name: /Step 1/ })
      expect(header).toBeInTheDocument()

      const environmentVariableLink = await screen.findByRole('link', {
        name: /environment variables/,
      })
      expect(environmentVariableLink).toBeInTheDocument()
      expect(environmentVariableLink).toHaveAttribute(
        'href',
        'https://app.circleci.com/settings/project/github/codecov/cool-repo/environment-variables'
      )
    })

    it('renders body', async () => {
      setup({})
      render(<CircleCI />, { wrapper })

      const body = await screen.findByText(
        "Environment variables in CircleCI can be found in project's settings."
      )
      expect(body).toBeInTheDocument()
    })

    describe('when org upload token exists', () => {
      it('renders global token copy', async () => {
        setup({ hasOrgUploadToken: true })
        render(<CircleCI />, { wrapper })

        const globalToken = await screen.findByText(/global token/)
        expect(globalToken).toBeInTheDocument()
      })

      it('renders token box', async () => {
        setup({ hasOrgUploadToken: true })
        render(<CircleCI />, { wrapper })

        const token = await screen.findByText('org-token-asdf-1234')
        expect(token).toBeInTheDocument()
      })
    })

    describe('when org upload token does not exist', () => {
      it('renders repository token copy', async () => {
        setup({})
        render(<CircleCI />, { wrapper })

        const repoToken = await screen.findByText(/repository token/)
        expect(repoToken).toBeInTheDocument()
      })

      it('renders token box', async () => {
        setup({})
        render(<CircleCI />, { wrapper })

        const token = await screen.findByText('repo-token-jkl;-7890')
        expect(token).toBeInTheDocument()
      })
    })
  })

  describe('step two', () => {
    beforeEach(() => setup({}))

    it('renders header', async () => {
      render(<CircleCI />, { wrapper })

      const header = await screen.findByRole('heading', { name: /Step 2/ })
      expect(header).toBeInTheDocument()

      const CircleCIWorkflowLink = await screen.findByRole('link', {
        name: /config.yml/,
      })
      expect(CircleCIWorkflowLink).toBeInTheDocument()
      expect(CircleCIWorkflowLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/cool-repo/tree/main/.circleci/config'
      )
    })

    it('renders yaml section', async () => {
      render(<CircleCI />, { wrapper })

      const yamlBox = await screen.findByText(
        /Add the following to your .circleci\/config.yaml and push changes to repository./
      )
      expect(yamlBox).toBeInTheDocument()
    })

    it('renders yaml code', async () => {
      render(<CircleCI />, { wrapper })

      const yamlCode = await screen.findByText(/codecov\/codecov@4.0.1/)
      expect(yamlCode).toBeInTheDocument()
    })

    it('renders example blurb', async () => {
      render(<CircleCI />, { wrapper })

      const blurb = await screen.findByTestId('example-blurb')
      expect(blurb).toBeInTheDocument()
    })
  })

  describe('step three', () => {
    beforeEach(() => setup({}))
    it('renders first body', async () => {
      render(<CircleCI />, { wrapper })

      const body = await screen.findByText(/Once you commit your changes/)
      expect(body).toBeInTheDocument()
    })

    it('renders second body', async () => {
      render(<CircleCI />, { wrapper })

      const body = await screen.findByText(/Once merged to your/)
      expect(body).toBeInTheDocument()
    })

    it('renders status check image', async () => {
      render(<CircleCI />, { wrapper })

      const img = await screen.findByRole('img', {
        name: 'codecov patch and project',
      })
      expect(img).toBeInTheDocument()
    })

    it('renders quick start link', async () => {
      render(<CircleCI />, { wrapper })

      const link = await screen.findByRole('link', { name: /learn more/ })
      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/quick-start'
      )
    })
  })

  describe('ending', () => {
    beforeEach(() => setup({}))
    it('renders body', async () => {
      render(<CircleCI />, { wrapper })

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
