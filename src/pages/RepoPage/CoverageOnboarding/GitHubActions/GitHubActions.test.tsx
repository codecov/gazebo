import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { eventTracker } from 'services/events/events'
import { ThemeContextProvider } from 'shared/ThemeContext'

import GitHubActions from './GitHubActions'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
}))

vi.mock('services/events/events')
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

const mockGetUploadTokenRequired = {
  owner: {
    orgUploadToken: 'org-token-asdf-1234',
    uploadTokenRequired: true,
    isAdmin: true,
  },
}

const mockDetailOwner = {
  owner: {
    ownerid: 1234,
    username: 'codecov',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1234?v=4',
    isCurrentUserPartOfOrg: true,
    isAdmin: true,
  },
}

const mockRegenerateOrgUploadToken = {
  regenerateOrgUploadToken: {
    error: null,
    orgUploadToken: 'new-org-token-asdf-1234',
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
      <ThemeContextProvider>
        <Route
          path={[
            '/:provider/:owner/:repo/new',
            '/:provider/:owner/:repo/new/other-ci',
          ]}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
      </ThemeContextProvider>
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

    server.use(
      graphql.query('GetRepo', () => {
        return HttpResponse.json({ data: mockGetRepo })
      }),
      graphql.query('GetOrgUploadToken', () => {
        return HttpResponse.json({ data: mockGetOrgUploadToken })
      }),
      graphql.query('GetUploadTokenRequired', () => {
        return HttpResponse.json({ data: mockGetUploadTokenRequired })
      }),
      graphql.query('DetailOwner', () => {
        return HttpResponse.json({ data: mockDetailOwner })
      }),
      graphql.mutation('regenerateOrgUploadToken', () => {
        return HttpResponse.json({ data: mockRegenerateOrgUploadToken })
      })
    )
    const user = userEvent.setup()

    return { user }
  }

  describe('when Go is selected', () => {
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
    it('tracks an event', async () => {
      setup({ hasOrgUploadToken: true })
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
      expect(eventTracker().track).toHaveBeenCalledTimes(4)
    })
  })
})
