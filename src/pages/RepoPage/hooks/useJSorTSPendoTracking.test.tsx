import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Link, MemoryRouter, Route } from 'react-router-dom'

import { useJSorTSPendoTracking } from './useJSorTSPendoTracking'

const mockUser = {
  me: {
    owner: {
      defaultOrgUsername: 'codecov',
    },
    email: 'jane.doe@codecov.io',
    privateAccess: true,
    onboardingCompleted: true,
    businessEmail: 'jane.doe@codecov.io',
    termsAgreement: true,
    user: {
      name: 'Jane Doe',
      username: 'janedoe',
      avatarUrl: 'http://127.0.0.1/avatar-url',
      avatar: 'http://127.0.0.1/avatar-url',
      student: false,
      studentCreatedAt: null,
      studentUpdatedAt: null,
      customerIntent: 'PERSONAL',
    },
    trackingMetadata: {
      service: 'github',
      ownerid: 123,
      serviceId: '123',
      plan: 'users-basic',
      staff: false,
      hasYaml: false,
      bot: null,
      delinquent: null,
      didTrial: null,
      planProvider: null,
      planUserCount: 1,
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      profile: {
        createdAt: 'timestamp',
        otherGoal: null,
        typeProjects: [],
        goals: [],
      },
    },
  },
}

const mockOverview = (language: string) => ({
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      testAnalyticsEnabled: true,
      languages: [language],
    },
  },
})

const mockOwner1 = {
  ownerid: 123,
  username: 'test-owner',
  avatarUrl: 'http://127.0.0.1/avatar-url',
  isCurrentUserPartOfOrg: true,
  isAdmin: true,
}

const mockOwner2 = {
  ownerid: 456,
  username: 'second-owner',
  avatarUrl: 'http://127.0.0.1/avatar-url',
  isCurrentUserPartOfOrg: true,
  isAdmin: true,
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/github/test-owner/test-repo']}>
      <Route path="/:provider/:owner/:repo">
        {children}
        <Link to="/:provider/second-owner/second-repo">ClickMe</Link>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  enablePendo?: boolean
  language?: string
}

describe('useJSorTSPendoTracking', () => {
  function setup({ enablePendo = false, language = 'javascript' }: SetupArgs) {
    server.use(
      graphql.query('CurrentUser', (info) => {
        return HttpResponse.json({ data: mockUser })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockOverview(language) })
      }),
      graphql.query('DetailOwner', (info) => {
        if (info.variables.username === 'second-owner') {
          return HttpResponse.json({ data: { owner: mockOwner2 } })
        }

        return HttpResponse.json({ data: { owner: mockOwner1 } })
      })
    )

    const updateOptionsMock = vi.fn()
    if (enablePendo) {
      window.pendo = {
        initialize: vi.fn(),
        updateOptions: updateOptionsMock,
      }
    } else {
      window.pendo = {}
    }

    const user = userEvent.setup()

    return { updateOptionsMock, user }
  }

  describe('js or ts is present', () => {
    describe('first render', () => {
      it('fires the event setting value to true', async () => {
        const { updateOptionsMock } = setup({
          enablePendo: true,
          language: 'javascript',
        })

        renderHook(() => useJSorTSPendoTracking(), { wrapper })

        await waitFor(() =>
          expect(updateOptionsMock).toHaveBeenCalledWith({
            account: expect.objectContaining({
              id: 123,
              name: 'test-owner',
            }),
            visitor: expect.objectContaining({
              js_or_ts_present: true,
            }),
          })
        )
      })
    })

    describe('repo has changed', () => {
      it('fires the event a second time setting value to true', async () => {
        const { updateOptionsMock, user } = setup({
          enablePendo: true,
          language: 'javascript',
        })

        renderHook(() => useJSorTSPendoTracking(), { wrapper })

        const link = screen.getByText('ClickMe')
        await user.click(link)

        await waitFor(() => expect(updateOptionsMock).toHaveBeenCalled())
        await waitFor(() =>
          expect(updateOptionsMock).toHaveBeenCalledWith({
            account: expect.objectContaining({
              id: 456,
              name: 'second-owner',
            }),
            visitor: expect.objectContaining({
              js_or_ts_present: true,
            }),
          })
        )
      })
    })
  })

  describe('js or ts is not present', () => {
    it('fires the event setting value to false', async () => {
      const { updateOptionsMock } = setup({
        enablePendo: true,
        language: 'python',
      })

      renderHook(() => useJSorTSPendoTracking(), { wrapper })

      await waitFor(() =>
        expect(updateOptionsMock).toHaveBeenCalledWith({
          account: expect.objectContaining({
            id: 123,
            name: 'test-owner',
          }),
          visitor: expect.objectContaining({
            js_or_ts_present: false,
          }),
        })
      )
    })
  })

  describe('pendo is not present in the window', () => {
    it('does not call pendo.updateOptions', async () => {
      const { updateOptionsMock } = setup({
        enablePendo: false,
        language: 'javascript',
      })

      renderHook(() => useJSorTSPendoTracking(), { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() => expect(updateOptionsMock).toHaveBeenCalled())
    })
  })
})
