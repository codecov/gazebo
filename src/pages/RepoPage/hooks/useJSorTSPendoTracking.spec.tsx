import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql } from 'msw'
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

const mockOverview = (language?: string) => {
  let languages: string[] = []
  if (language) {
    languages = [language]
  }

  return {
    owner: {
      repository: {
        __typename: 'Repository',
        private: false,
        defaultBranch: 'main',
        oldestCommitAt: '2022-10-10T11:59:59',
        coverageEnabled: true,
        bundleAnalysisEnabled: true,
        languages,
        testAnalyticsEnabled: true,
      },
    },
  }
}

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
  function setup({ enablePendo = false, language }: SetupArgs) {
    server.use(
      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockUser))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockOverview(language)))
      }),
      graphql.query('DetailOwner', (req, res, ctx) => {
        if (req.variables.username === 'second-owner') {
          return res(
            ctx.data({
              owner: mockOwner2,
            })
          )
        }

        return res(
          ctx.data({
            owner: mockOwner1,
          })
        )
      })
    )

    const updateOptionsMock = jest.fn()
    if (enablePendo) {
      window.pendo = {
        updateOptions: updateOptionsMock,
      }
    }

    const user = userEvent.setup()

    return { updateOptionsMock, user }
  }

  describe('js or ts is present', () => {
    describe('first render', () => {
      it('fires the event', async () => {
        const { updateOptionsMock } = setup({
          enablePendo: true,
          language: 'javascript',
        })

        renderHook(() => useJSorTSPendoTracking(), { wrapper })

        await waitFor(() => expect(updateOptionsMock).toHaveBeenCalled())
        await waitFor(() =>
          expect(updateOptionsMock).toHaveBeenCalledWith({
            account: {
              id: 123,
              is_admin: true,
              is_current_user_part_of_org: true,
              name: 'test-owner',
            },
            visitor: {
              business_email: 'jane.doe@codecov.io',
              created_at: 'timestamp',
              default_org: null,
              email: 'jane.doe@codecov.io',
              full_name: 'janedoe',
              guest: false,
              id: 123,
              js_or_ts_present: true,
              onboarding_completed: true,
              ownerid: 123,
              plan: 'users-basic',
              plan_user_count: 1,
              profile: {
                created_at: 'timestamp',
                goals: [],
                other_goal: null,
                type_projects: [],
              },
              profile_created_at: 'timestamp',
              profile_goals: [],
              profile_other_goal: null,
              profile_type_projects: [],
              service: 'github',
              staff: false,
              updated_at: 'timestamp',
              username: 'janedoe',
            },
          })
        )
      })
    })

    describe('owner has changed', () => {
      it('fires the event a second time', async () => {
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
            account: {
              id: 456,
              is_admin: true,
              is_current_user_part_of_org: true,
              name: 'second-owner',
            },
            visitor: {
              business_email: 'jane.doe@codecov.io',
              created_at: 'timestamp',
              default_org: null,
              email: 'jane.doe@codecov.io',
              full_name: 'janedoe',
              guest: false,
              id: 123,
              js_or_ts_present: true,
              onboarding_completed: true,
              ownerid: 123,
              plan: 'users-basic',
              plan_user_count: 1,
              profile: {
                created_at: 'timestamp',
                goals: [],
                other_goal: null,
                type_projects: [],
              },
              profile_created_at: 'timestamp',
              profile_goals: [],
              profile_other_goal: null,
              profile_type_projects: [],
              service: 'github',
              staff: false,
              updated_at: 'timestamp',
              username: 'janedoe',
            },
          })
        )
      })
    })
  })

  describe('js or ts is not present', () => {
    it('does not call pendo.updateOptions', async () => {
      const { updateOptionsMock } = setup({
        enablePendo: true,
        language: 'python',
      })

      renderHook(() => useJSorTSPendoTracking(), { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() => expect(updateOptionsMock).not.toHaveBeenCalled())
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

      await waitFor(() => expect(updateOptionsMock).not.toHaveBeenCalled())
    })
  })
})
