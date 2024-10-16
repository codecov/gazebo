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
      graphql.query('GetRepo', (info) => {
        return HttpResponse.json({ data: mockGetRepo })
      }),
      graphql.query('GetOrgUploadToken', (info) => {
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

  describe('step one', () => {
    it('renders header', async () => {
      setup({})
      render(<GitHubActions />, { wrapper })

      const header = await screen.findByRole('heading', { name: /Step 2/ })
      expect(header).toBeInTheDocument()
    })

    it('renders framework blurb', async () => {
      setup({})
      render(<GitHubActions />, { wrapper })

      const blurb = await screen.findByText(
        /Select your testing framework below/
      )
      expect(blurb).toBeInTheDocument()
    })

    it('renders install step', async () => {
      setup({})
      render(<GitHubActions />, { wrapper })

      const text = await screen.findByText(
        'Install requirements in your terminal:'
      )
      expect(text).toBeInTheDocument()

      const command = await screen.findByText('npm install --save-dev jest')
      expect(command).toBeInTheDocument()
    })

    it('renders run step', async () => {
      setup({})
      render(<GitHubActions />, { wrapper })

      const text = await screen.findByText(
        'In a GitHub Action, run tests and generate a coverage report:'
      )
      expect(text).toBeInTheDocument()

      const command = await screen.findByText('npx jest --coverage')
      expect(command).toBeInTheDocument()
    })

    describe('framework selector', () => {
      it('renders', async () => {
        setup({})
        render(<GitHubActions />, { wrapper })

        const selector = await screen.findByRole('combobox')
        expect(selector).toBeInTheDocument()
      })

      describe('when clicked', () => {
        it('renders dropdown', async () => {
          const { user } = setup({})
          render(<GitHubActions />, { wrapper })

          const selector = await screen.findByRole('combobox')
          expect(selector).toBeInTheDocument()

          let vitest = screen.queryByText('Vitest')
          let pytest = screen.queryByText('Pytest')
          let go = screen.queryByText('Go')
          expect(vitest).not.toBeInTheDocument()
          expect(pytest).not.toBeInTheDocument()
          expect(go).not.toBeInTheDocument()

          await user.click(selector)

          vitest = await screen.findByText('Vitest')
          pytest = await screen.findByText('Pytest')
          go = await screen.findByText('Go')
          expect(vitest).toBeInTheDocument()
          expect(pytest).toBeInTheDocument()
          expect(go).toBeInTheDocument()
        })
      })

      describe('when Go is selected', () => {
        it('does not render install step', async () => {
          const { user } = setup({})
          render(<GitHubActions />, { wrapper })

          const selector = await screen.findByRole('combobox')
          expect(selector).toBeInTheDocument()

          await user.click(selector)

          const go = await screen.findByText('Go')
          expect(go).toBeInTheDocument()

          await user.click(go)

          const install = screen.queryByText(
            'Install requirements in your terminal:'
          )
          expect(install).not.toBeInTheDocument()
        })

        it('updates run step', async () => {
          const { user } = setup({})
          render(<GitHubActions />, { wrapper })

          const selector = await screen.findByRole('combobox')
          expect(selector).toBeInTheDocument()

          await user.click(selector)

          const go = await screen.findByText('Go')
          expect(go).toBeInTheDocument()

          await user.click(go)

          const run = await screen.findByText(
            'In a GitHub Action, run tests and generate a coverage report:'
          )
          expect(run).toBeInTheDocument()

          const command = await screen.findByText(
            'go test -coverprofile=coverage.txt'
          )
          expect(command).toBeInTheDocument()
        })

        it('updates example yaml', async () => {
          const { user } = setup({})
          render(<GitHubActions />, { wrapper })

          const selector = await screen.findByRole('combobox')
          expect(selector).toBeInTheDocument()

          await user.click(selector)

          const go = await screen.findByText('Go')
          expect(go).toBeInTheDocument()

          await user.click(go)

          const trigger = await screen.findByText((content) =>
            content.startsWith('Your final GitHub Actions workflow')
          )
          expect(trigger).toBeInTheDocument()

          await user.click(trigger)

          const yaml = await screen.findByText(/go mod download/)
          expect(yaml).toBeInTheDocument()
        })
      })
    })

    describe('example collapsible', () => {
      it('renders', async () => {
        setup({})
        render(<GitHubActions />, { wrapper })

        const trigger = await screen.findByText((content) =>
          content.startsWith('Your final GitHub Actions workflow')
        )
        expect(trigger).toBeInTheDocument()
      })

      describe('when the collapsible is open', () => {
        it('renders example GHA yaml', async () => {
          const { user } = setup({})
          render(<GitHubActions />, { wrapper })

          const trigger = await screen.findByText((content) =>
            content.startsWith('Your final GitHub Actions workflow')
          )
          expect(trigger).toBeInTheDocument()

          let example = screen.queryByText(
            /name: Run tests and upload coverage/
          )
          expect(example).not.toBeInTheDocument()

          await user.click(trigger)

          example = await screen.findByText(
            /name: Run tests and upload coverage/
          )
          expect(example).toBeInTheDocument()
        })

        describe('if using repo token', () => {
          it('does not show repo slug in yaml', async () => {
            const { user } = setup({})
            render(<GitHubActions />, { wrapper })

            const trigger = await screen.findByText((content) =>
              content.startsWith('Your final GitHub Actions workflow')
            )
            expect(trigger).toBeInTheDocument()

            await user.click(trigger)

            const slug = screen.queryByText(/slug: codecov\/cool-repo/)
            expect(slug).not.toBeInTheDocument()
          })
        })

        describe('if using org token', () => {
          it('shows repo slug in yaml', async () => {
            const { user } = setup({ hasOrgUploadToken: true })
            render(<GitHubActions />, { wrapper })

            const trigger = await screen.findByText((content) =>
              content.startsWith('Your final GitHub Actions workflow')
            )
            expect(trigger).toBeInTheDocument()

            await user.click(trigger)

            const slug = await screen.findByText(/slug: codecov\/cool-repo/)
            expect(slug).toBeInTheDocument()
          })
        })

        it('renders learn more blurb', async () => {
          const { user } = setup({})
          render(<GitHubActions />, { wrapper })

          const trigger = await screen.findByText((content) =>
            content.startsWith('Your final GitHub Actions workflow')
          )
          expect(trigger).toBeInTheDocument()

          let blurb = screen.queryByText(/about generating coverage reports/)
          expect(blurb).not.toBeInTheDocument()

          await user.click(trigger)

          blurb = await screen.findByText(/about generating coverage reports/)
          expect(blurb).toBeInTheDocument()
        })
      })
    })
  })

  describe('step two', () => {
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
        /Admin required to access repo configuration > secrets and variable > actions/
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

      // Expand the yaml example dropdown to make that snippet visible
      const trigger = await screen.findByText((content) =>
        content.startsWith('Your final GitHub Actions workflow')
      )
      expect(trigger).toBeInTheDocument()

      await user.click(trigger)

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
