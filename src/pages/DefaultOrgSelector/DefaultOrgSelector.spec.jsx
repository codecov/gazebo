import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { useIntersection } from 'react-use'

import DefaultOrgSelector from './DefaultOrgSelector'

jest.mock('react-use/lib/useIntersection')
jest.mock('./GitHubHelpBanner', () => () => 'GitHubHelpBanner')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const mockTrialData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  value: 'users-basic',
  trialStatus: 'ONGOING',
  trialStartDate: '2023-01-01T08:55:25',
  trialEndDate: '2023-01-10T08:55:25',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
}

let testLocation
const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo">
            <Suspense fallback={null}>{children}</Suspense>
          </Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  })
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('DefaultOrgSelector', () => {
  beforeEach(() => jest.resetModules())

  function setup({
    myOrganizationsData,
    useUserData,
    isValidUser = true,
    trialStatus = 'NOT_STARTED',
    value = 'users-basic',
  } = {}) {
    const mockMutationVariables = jest.fn()
    const mockTrialMutationVariables = jest.fn()
    const mockWindow = jest.fn()
    window.open = mockWindow
    const fetchNextPage = jest.fn()
    const user = userEvent.setup()

    server.use(
      graphql.query('UseMyOrganizations', (req, res, ctx) => {
        if (!!req.variables.after) {
          fetchNextPage(req.variables.after)
        }
        return res(ctx.status(200), ctx.data(myOrganizationsData))
      }),
      graphql.query('CurrentUser', (req, res, ctx) => {
        if (!isValidUser) {
          return res(ctx.status(200), ctx.data({ me: null }))
        }
        return res(ctx.status(200), ctx.data(useUserData))
      }),
      graphql.query('GetPlanData', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              hasPrivateRepos: true,
              plan: {
                ...mockTrialData,
                trialStatus,
                value,
              },
              pretrialPlan: {
                baseUnitPrice: 10,
                benefits: [],
                billingRate: 'monthly',
                marketingName: 'Users Basic',
                monthlyUploadLimit: 250,
                value: 'users-basic',
              },
            },
          })
        )
      }),
      graphql.mutation('updateDefaultOrganization', (req, res, ctx) => {
        mockMutationVariables(req.variables)
        return res(
          ctx.status(200),
          ctx.data({
            updateDefaultOrganization: {
              defaultOrg: {
                username: 'criticalRole',
              },
            },
          })
        )
      }),
      graphql.mutation('startTrial', (req, res, ctx) => {
        mockTrialMutationVariables(req?.variables)

        return res(ctx.status(200))
      })
    )

    return {
      user,
      mockMutationVariables,
      mockTrialMutationVariables,
      mockWindow,
      fetchNextPage,
    }
  }

  describe('page renders', () => {
    beforeEach(() =>
      setup({
        useUserData: {
          me: {
            email: 'chetney@cr.com',
            termsAgreement: false,
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })
    )

    it('only renders the component after a valid user is returned from the useUser hook', async () => {
      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      let selectLabel = screen.queryByText(
        /Which organization are you using today?/
      )
      expect(selectLabel).not.toBeInTheDocument()

      selectLabel = await screen.findByText(
        /Which organization are you using today?/
      )
      expect(selectLabel).toBeInTheDocument()
    })

    it('renders the select input', async () => {
      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const selectOrg = await screen.findByRole('button', {
        name: 'Select an organization',
      })

      expect(selectOrg).toBeInTheDocument()
    })

    it('renders the select input with the correct options', async () => {
      const { user } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            owner: {
              username: 'Rula',
              avatarUrl:
                'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
              ownerid: 9,
            },
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const selectOrg = await screen.findByRole('button', {
        name: 'Select an organization',
      })

      await user.click(selectOrg)

      const orgInList = screen.getByRole('option', { name: 'criticalRole' })
      expect(orgInList).toBeInTheDocument()

      const selfOrg = screen.getByRole('option', { name: 'Rula' })
      expect(selfOrg).toBeInTheDocument()

      const addNewOrg = screen.getByRole('option', {
        name: 'plus-circle.svg Add GitHub organization',
      })
      expect(addNewOrg).toBeInTheDocument()
    })

    it('does not render add org on different providers', async () => {
      const { user } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, {
        wrapper: wrapper(['/gl/codecov/cool-repo']),
      })

      const selectOrg = await screen.findByRole('button', {
        name: 'Select an organization',
      })

      await user.click(selectOrg)

      const orgInList = screen.getByRole('option', { name: 'criticalRole' })
      expect(orgInList).toBeInTheDocument()

      const addNewOrg = screen.queryByRole('option', {
        name: 'plus-circle.svg Add GitHub organization',
      })
      expect(addNewOrg).not.toBeInTheDocument()
    })

    it('opens new page on add org select', async () => {
      const { user, mockWindow } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, {
        wrapper: wrapper(['/gh/codecov/cool-repo']),
      })

      const selectOrg = await screen.findByRole('button', {
        name: 'Select an organization',
      })

      await user.click(selectOrg)

      const addNewOrg = screen.getByRole('option', {
        name: 'plus-circle.svg Add GitHub organization',
      })

      await user.click(addNewOrg)

      await waitFor(() =>
        expect(mockWindow).toHaveBeenCalledWith(
          'https://github.com/apps/codecov/installations/new',
          '_blank'
        )
      )
    })

    it('renders continue button', async () => {
      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const submit = await screen.findByRole('button', {
        name: /Continue/,
      })
      expect(submit).toBeInTheDocument()
    })

    it('renders GitHubHelpBanner', async () => {
      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const helpFindingOrg = await screen.findByText(/GitHubHelpBanner/)
      expect(helpFindingOrg).toBeInTheDocument()
    })
  })

  describe('on submit', () => {
    beforeEach(() => jest.resetAllMocks())
    it('fires update default org mutation', async () => {
      const { user, mockMutationVariables } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const selectLabel = await screen.findByText(
        /Which organization are you using today?/
      )
      expect(selectLabel).toBeInTheDocument()

      const selectOrg = screen.getByRole('button', {
        name: 'Select an organization',
      })
      await user.click(selectOrg)

      const orgInList = screen.getByRole('option', { name: 'criticalRole' })
      await user.click(orgInList)

      const submit = await screen.findByRole('button', {
        name: /Continue/,
      })

      await user.click(submit)

      await waitFor(() =>
        expect(mockMutationVariables).toHaveBeenLastCalledWith({
          input: {
            username: 'criticalRole',
          },
        })
      )

      await waitFor(() =>
        expect(testLocation.pathname).toBe('/gh/criticalRole')
      )
    })

    it('redirects to the default org page', async () => {
      const { user } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const selectLabel = await screen.findByText(
        /Which organization are you using today?/
      )
      expect(selectLabel).toBeInTheDocument()

      const selectOrg = screen.getByRole('button', {
        name: 'Select an organization',
      })
      await user.click(selectOrg)

      const orgInList = screen.getByRole('option', { name: 'criticalRole' })
      await user.click(orgInList)

      const submit = await screen.findByRole('button', {
        name: /Continue/,
      })

      await user.click(submit)

      await waitFor(() =>
        expect(testLocation.pathname).toBe('/gh/criticalRole')
      )
    })
  })

  describe('on submit with no default org', () => {
    beforeEach(() => jest.resetAllMocks())

    it('redirects to self org page', async () => {
      const { user, mockMutationVariables } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const submit = await screen.findByRole('button', {
        name: /Continue/,
      })

      await user.click(submit)

      await waitFor(() =>
        expect(mockMutationVariables).toHaveBeenLastCalledWith({
          input: {
            username: 'chetney',
          },
        })
      )

      expect(testLocation.pathname).toBe('/gh/chetney')
    })

    it('fires start trial mutation', async () => {
      const { user, mockTrialMutationVariables } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const submit = await screen.findByRole('button', {
        name: /Continue/,
      })

      await user.click(submit)

      expect(mockTrialMutationVariables).not.toHaveBeenCalled()
    })
  })

  describe('on submit with a self org', () => {
    it('does not fire trial mutation', async () => {
      const { user, mockTrialMutationVariables } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'chetney',
                    ownerid: 1,
                  },
                },
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const selectLabel = await screen.findByText(
        /Which organization are you using today?/
      )
      expect(selectLabel).toBeInTheDocument()

      const selectOrg = screen.getByRole('button', {
        name: 'Select an organization',
      })
      await user.click(selectOrg)

      const orgInList = screen.getByRole('option', { name: 'chetney' })
      await user.click(orgInList)

      const submit = await screen.findByRole('button', {
        name: /Continue/,
      })

      await user.click(submit)

      expect(mockTrialMutationVariables).not.toHaveBeenCalled()
    })
  })

  describe('on submit with a free plan', () => {
    it('does not fire trial mutation', async () => {
      const { user, mockTrialMutationVariables } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        value: 'users-free',
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'chetney',
                    ownerid: 1,
                  },
                },
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const selectLabel = await screen.findByText(
        /Which organization are you using today?/
      )
      expect(selectLabel).toBeInTheDocument()

      const selectOrg = screen.getByRole('button', {
        name: 'Select an organization',
      })
      await user.click(selectOrg)

      const orgInList = screen.getByRole('option', { name: 'chetney' })
      await user.click(orgInList)

      const submit = await screen.findByRole('button', {
        name: /Continue/,
      })

      await user.click(submit)

      expect(mockTrialMutationVariables).not.toHaveBeenCalled()
    })
  })

  describe('on submit with self org selected', () => {
    beforeEach(() => jest.resetAllMocks())

    it('fires update default org mutation', async () => {
      const { user, mockMutationVariables } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            owner: {
              username: 'Rula',
              avatarUrl:
                'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
              ownerid: 9,
            },
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const selectOrg = await screen.findByRole('button', {
        name: 'Select an organization',
      })

      await user.click(selectOrg)

      const selfOrg = screen.getByRole('option', { name: 'Rula' })
      expect(selfOrg).toBeInTheDocument()

      await user.click(selfOrg)

      const submit = await screen.findByRole('button', {
        name: /Continue/,
      })

      await user.click(submit)

      await waitFor(() =>
        expect(mockMutationVariables).toHaveBeenLastCalledWith({
          input: {
            username: 'Rula',
          },
        })
      )
    })

    it('redirects to self org', async () => {
      const { user } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            owner: {
              username: 'Rula',
              avatarUrl:
                'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
              ownerid: 9,
            },
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const selectOrg = await screen.findByRole('button', {
        name: 'Select an organization',
      })

      await user.click(selectOrg)

      const selfOrg = screen.getByRole('option', { name: 'Rula' })
      expect(selfOrg).toBeInTheDocument()

      await user.click(selfOrg)

      const submit = await screen.findByRole('button', {
        name: /Continue/,
      })

      await user.click(submit)

      await waitFor(() => expect(testLocation.pathname).toBe('/gh/Rula'))
    })
  })

  describe('on submit with no default org selected', () => {
    beforeEach(() => jest.resetAllMocks())

    it('redirects to self org page', async () => {
      const { user, mockMutationVariables } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const submit = await screen.findByRole('button', {
        name: /Continue/,
      })

      await user.click(submit)

      await waitFor(() =>
        expect(mockMutationVariables).toHaveBeenLastCalledWith({
          input: {
            username: 'chetney',
          },
        })
      )

      expect(testLocation.pathname).toBe('/gh/chetney')
    })
  })

  describe('on submit with a free basic plan', () => {
    beforeEach(() => jest.resetAllMocks())

    it('fires trial mutation', async () => {
      const { user, mockTrialMutationVariables } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'chetney',
                    ownerid: 1,
                  },
                },
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
        value: 'users-basic',
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const selectLabel = await screen.findByText(
        /Which organization are you using today?/
      )
      expect(selectLabel).toBeInTheDocument()

      const selectOrg = screen.getByRole('button', {
        name: 'Select an organization',
      })
      await user.click(selectOrg)

      const orgInList = await screen.findByRole('option', {
        name: 'criticalRole',
      })
      await user.click(orgInList)

      const submit = await screen.findByRole('button', {
        name: /Continue/,
      })

      await user.click(submit)

      await waitFor(() =>
        expect(mockTrialMutationVariables).toHaveBeenLastCalledWith({
          input: {
            orgUsername: 'criticalRole',
          },
        })
      )
    })

    it('renders load more on load more trigger', async () => {
      const { user } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'chetney',
                    ownerid: 1,
                  },
                },
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: true, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const selectOrg = await screen.findByRole('button', {
        name: 'Select an organization',
      })

      await user.click(selectOrg)

      const loadMore = await screen.findByText(/Loading more items.../)
      expect(loadMore).toBeInTheDocument()
    })
  })

  describe('on submit with a different trial status', () => {
    it('does not fire trial mutation', async () => {
      const { user, mockTrialMutationVariables } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'chetney',
                    ownerid: 1,
                  },
                },
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
        trialStatus: 'IN_PROGRESS',
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const selectLabel = await screen.findByText(
        /Which organization are you using today?/
      )
      expect(selectLabel).toBeInTheDocument()

      const selectOrg = screen.getByRole('button', {
        name: 'Select an organization',
      })
      await user.click(selectOrg)

      const orgInList = screen.getByRole('option', { name: 'criticalRole' })
      await user.click(orgInList)

      const submit = await screen.findByRole('button', {
        name: /Continue/,
      })

      await user.click(submit)

      expect(mockTrialMutationVariables).not.toHaveBeenCalled()
    })
  })

  describe('no current user', () => {
    it('redirects to login', async () => {
      setup({
        useUserData: {
          me: null,
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    avatarUrl:
                      'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
                    username: 'criticalRole',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: false, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      await waitFor(() => expect(testLocation.pathname).toBe('/login'))
    })
  })

  describe('on fetch next page', () => {
    it('renders next page', async () => {
      const { user, fetchNextPage } = setup({
        useUserData: {
          me: {
            email: 'personal@cr.com',
            trackingMetadata: {
              ownerid: '1234',
            },
            user: {
              username: 'chetney',
            },
          },
        },
        myOrganizationsData: {
          me: {
            myOrganizations: {
              edges: [
                {
                  node: {
                    username: 'chetney',
                    ownerid: 1,
                  },
                },
              ],
              pageInfo: { hasNextPage: true, endCursor: 'MTI=' },
            },
          },
        },
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })
      useIntersection.mockReturnValue({ isIntersecting: true })

      const selectOrg = await screen.findByRole('button', {
        name: 'Select an organization',
      })

      await user.click(selectOrg)

      await waitFor(() => expect(fetchNextPage).toHaveBeenCalled())
      await waitFor(() => expect(fetchNextPage).toHaveBeenCalledWith('MTI='))
    })
  })
})
