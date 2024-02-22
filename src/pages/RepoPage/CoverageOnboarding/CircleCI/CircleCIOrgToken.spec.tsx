import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import CircleCIOrgToken from './CircleCIOrgToken'

const mockGetRepo = {
  owner: {
    isCurrentUserPartOfOrg: true,
    orgUploadToken: '9e6a6189-20f1-482d-ab62-test',
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

describe('CircleCIOrgToken', () => {
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

  describe('step one', () => {
    describe('when org upload token exists', () => {
      beforeEach(() => setup(true))

      it('renders header', async () => {
        render(<CircleCIOrgToken />, { wrapper })

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

      it('renders global token copy', async () => {
        render(<CircleCIOrgToken />, { wrapper })

        const globalToken = await screen.findByText(/global token/)
        expect(globalToken).toBeInTheDocument()
      })

      it('renders body', async () => {
        render(<CircleCIOrgToken />, { wrapper })

        const body = await screen.findByText(
          "Environment variables in CircleCI can be found in project's settings."
        )
        expect(body).toBeInTheDocument()
      })

      it('renders token box', async () => {
        render(<CircleCIOrgToken />, { wrapper })

        const token = await screen.findByText(
          /CODECOV_TOKEN=9e6a6189-20f1-482d-ab62-ecfaa2629290/
        )
        expect(token).toBeInTheDocument()
      })
    })

    describe('when org upload token does not exist', () => {
      beforeEach(() => setup(false))

      it('renders header', async () => {
        render(<CircleCIOrgToken />, { wrapper })

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

      it('renders repository token copy', async () => {
        render(<CircleCIOrgToken />, { wrapper })

        const repoToken = await screen.findByText(/repository token/)
        expect(repoToken).toBeInTheDocument()
      })

      it('renders body', async () => {
        render(<CircleCIOrgToken />, { wrapper })

        const body = await screen.findByText(
          "Environment variables in CircleCI can be found in project's settings."
        )
        expect(body).toBeInTheDocument()
      })

      it('renders token box', async () => {
        render(<CircleCIOrgToken />, { wrapper })

        const token = await screen.findByText(
          /CODECOV_TOKEN=9e6a6189-20f1-482d-ab62-ecfaa2629295/
        )
        expect(token).toBeInTheDocument()
      })
    })
  })

  describe('step two', () => {
    beforeEach(() => setup(true))

    it('renders header', async () => {
      render(<CircleCIOrgToken />, { wrapper })

      const header = await screen.findByRole('heading', { name: /Step 2/ })
      expect(header).toBeInTheDocument()

      const CircleCIOrgTokenWorkflowLink = await screen.findByRole('link', {
        name: /config.yml/,
      })
      expect(CircleCIOrgTokenWorkflowLink).toBeInTheDocument()
      expect(CircleCIOrgTokenWorkflowLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/cool-repo/tree/main/.circleci/config'
      )
    })

    it('renders yaml section', async () => {
      render(<CircleCIOrgToken />, { wrapper })

      const yamlBox = await screen.findByText(
        /Add the following to your .circleci\/config.yaml and push changes to repository./
      )
      expect(yamlBox).toBeInTheDocument()
    })

    it('renders yaml code', async () => {
      render(<CircleCIOrgToken />, { wrapper })

      const yamlCode = await screen.findByText(/codecov\/codecov@4.0.1/)
      expect(yamlCode).toBeInTheDocument()
    })

    it('renders example blurb', async () => {
      render(<CircleCIOrgToken />, { wrapper })

      const blurb = await screen.findByTestId('example-blurb')
      expect(blurb).toBeInTheDocument()
    })
  })

  describe('step three', () => {
    beforeEach(() => setup(true))
    it('renders first body', async () => {
      render(<CircleCIOrgToken />, { wrapper })

      const body = await screen.findByText(/After you committed your changes/)
      expect(body).toBeInTheDocument()
    })

    it('renders second body', async () => {
      render(<CircleCIOrgToken />, { wrapper })

      const body = await screen.findByText(/Once merged to the/)
      expect(body).toBeInTheDocument()
    })

    it('renders status check image', async () => {
      render(<CircleCIOrgToken />, { wrapper })

      const img = await screen.findByRole('img', {
        name: 'codecov patch and project',
      })
      expect(img).toBeInTheDocument()
    })
  })

  describe('ending', () => {
    beforeEach(() => setup(true))
    it('renders quick start link', async () => {
      render(<CircleCIOrgToken />, { wrapper })

      const link = await screen.findByRole('link', { name: /learn more/ })
      expect(link).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/quick-start'
      )
    })
    it('renders body', async () => {
      render(<CircleCIOrgToken />, { wrapper })

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
