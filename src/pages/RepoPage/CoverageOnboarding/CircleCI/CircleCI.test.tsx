import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import CircleCI from './CircleCI'

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

  describe('output coverage step', () => {
    it('renders header', async () => {
      setup({})
      render(<CircleCI />, { wrapper })

      const header = await screen.findByText(
        /Step \d: Output a Coverage report file in your CI/
      )
      expect(header).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup({})
      render(<CircleCI />, { wrapper })

      const body = await screen.findByText(/Select your language below/)
      expect(body).toBeInTheDocument()

      const jest = await screen.findByText(/Jest/)
      expect(jest).toBeInTheDocument()
    })
  })

  describe('token step', () => {
    it('renders header', async () => {
      setup({})
      render(<CircleCI />, { wrapper })

      const header = await screen.findByRole('heading', {
        name: /Step \d: add repository token to environment variables/,
      })
      expect(header).toBeInTheDocument()
    })

    it('renders body', async () => {
      setup({})
      render(<CircleCI />, { wrapper })

      const link = await screen.findByRole('link', {
        name: 'Environment variables',
      })
      expect(link).toBeInTheDocument()

      const body = await screen.findByText(
        /in CircleCI can be found in project settings/
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

    describe('has dropdown', () => {
      it('renders dropdown click target', async () => {
        setup({})
        render(<CircleCI />, { wrapper })

        const trigger = await screen.findByText((content) =>
          content.startsWith(
            'Your environment variable in CircleCI should look like this:'
          )
        )
        expect(trigger).toBeInTheDocument()
      })
      it('renders dropdown content after clicked', async () => {
        const { user } = setup({})
        render(<CircleCI />, { wrapper })

        let content = screen.queryByRole('img', {
          name: /settings environment variable/,
        })
        expect(content).not.toBeInTheDocument()

        const trigger = await screen.findByText((content) =>
          content.startsWith(
            'Your environment variable in CircleCI should look like this:'
          )
        )
        await user.click(trigger)

        content = await screen.findByRole('img', {
          name: /settings environment variable/,
        })
        expect(content).toBeInTheDocument()
      })
    })
  })

  describe('orb yaml step', () => {
    beforeEach(() => setup({}))

    it('renders header', async () => {
      render(<CircleCI />, { wrapper })

      const header = await screen.findByRole('heading', {
        name: /Step \d: add Codecov orb to CircleCI/,
      })
      expect(header).toBeInTheDocument()

      const CircleCIJSWorkflowLink = await screen.findByRole('link', {
        name: 'config.yml',
      })
      expect(CircleCIJSWorkflowLink).toBeInTheDocument()

      const CircleCIJSExampleLink = await screen.findByRole('link', {
        name: /JavaScript config.yml/,
      })
      expect(CircleCIJSExampleLink).toBeInTheDocument()
      expect(CircleCIJSExampleLink).toHaveAttribute(
        'href',
        'https://github.com/codecov/example-javascript/blob/main/.circleci/config.yml'
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

      const yamlCode = await screen.findByText(/codecov\/codecov@5/)
      expect(yamlCode).toBeInTheDocument()
    })

    it('renders example blurb', async () => {
      render(<CircleCI />, { wrapper })

      const blurb = await screen.findByTestId('example-blurb')
      expect(blurb).toBeInTheDocument()
    })
  })

  describe('merge step', () => {
    beforeEach(() => setup({}))

    it('renders header', async () => {
      render(<CircleCI />, { wrapper })

      const header = await screen.findByText(
        /Step \d: merge to main or your preferred feature branch/
      )
      expect(header).toBeInTheDocument()
    })

    it('renders body', async () => {
      render(<CircleCI />, { wrapper })

      const body = await screen.findByText(
        /Once merged to your default branch,/
      )
      expect(body).toBeInTheDocument()
    })
  })

  describe('feedback CTA', () => {
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

  describe('learn more blurb', () => {
    it('renders body', async () => {
      setup({})
      render(<CircleCI />, { wrapper })

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
      // will be removing this stuff soon, backend for this doesn't exist anymore
      const { mockMetricMutationVariables } = setup({})
      const user = userEvent.setup()
      render(<CircleCI />, { wrapper })

      const copyCommands = await screen.findAllByTestId(
        'clipboard-code-snippet'
      )
      expect(copyCommands.length).toEqual(5)

      await user.click(copyCommands[1] as HTMLElement)

      await user.click(copyCommands[2] as HTMLElement)
      await waitFor(() =>
        expect(mockMetricMutationVariables).toHaveBeenCalledTimes(1)
      )
    })
  })
})
