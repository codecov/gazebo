import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { trackSegmentEvent } from 'services/tracking/segment'

import DefaultOrgSelector from './DefaultOrgSelector'

jest.mock('services/tracking/segment')
jest.mock('./GitHubHelpBanner', () => () => 'GitHubHelpBanner')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

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
    trialStatus,
    planName,
  } = {}) {
    const mockMutationVariables = jest.fn()
    const mockTrialMutationVariables = jest.fn()
    const user = userEvent.setup()

    server.use(
      graphql.query('UseMyOrganizations', (req, res, ctx) => {
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
              plan: {
                trialStatus,
                planName,
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
        mockTrialMutationVariables(req.variables)
        return res(ctx.status(200), ctx.data({}))
      })
    )

    return { user, mockMutationVariables, mockTrialMutationVariables }
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

      let selectLabel = screen.queryByText(/What org would you like to setup?/)
      expect(selectLabel).not.toBeInTheDocument()

      selectLabel = await screen.findByText(/What org would you like to setup?/)
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

      const addNewOrg = screen.getByRole('link', {
        name: 'plus-circle.svg Add GitHub organization external-link.svg',
      })
      expect(addNewOrg).toBeInTheDocument()
      expect(addNewOrg).toHaveAttribute(
        'href',
        'https://github.com/apps/codecov/installations/new'
      )
    })

    it('renders continue to app button', async () => {
      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const submit = await screen.findByRole('button', {
        name: /Continue to app/,
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

    it('tracks the segment event', async () => {
      const segmentMock = jest.fn()
      trackSegmentEvent.mockReturnValue(segmentMock)

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
        /What org would you like to setup?/
      )
      expect(selectLabel).toBeInTheDocument()

      const selectOrg = screen.getByRole('button', {
        name: 'Select an organization',
      })
      await user.click(selectOrg)

      const orgInList = screen.getByRole('option', { name: 'criticalRole' })
      await user.click(orgInList)

      const submit = await screen.findByRole('button', {
        name: /Continue to app/,
      })

      await user.click(submit)

      expect(trackSegmentEvent).toHaveBeenLastCalledWith({
        event: 'Onboarding default org selector',
        data: {
          org: 'criticalRole',
          ownerid: '1234',
          username: 'chetney',
        },
      })
    })

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
        /What org would you like to setup?/
      )
      expect(selectLabel).toBeInTheDocument()

      const selectOrg = screen.getByRole('button', {
        name: 'Select an organization',
      })
      await user.click(selectOrg)

      const orgInList = screen.getByRole('option', { name: 'criticalRole' })
      await user.click(orgInList)

      const submit = await screen.findByRole('button', {
        name: /Continue to app/,
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
        planName: 'users-inappm',
        trialStatus: 'NOT_STARTED',
      })

      render(<DefaultOrgSelector />, { wrapper: wrapper() })

      const selectLabel = await screen.findByText(
        /What org would you like to setup?/
      )
      expect(selectLabel).toBeInTheDocument()

      const selectOrg = screen.getByRole('button', {
        name: 'Select an organization',
      })
      await user.click(selectOrg)

      const orgInList = screen.getByRole('option', { name: 'criticalRole' })
      await user.click(orgInList)

      const submit = await screen.findByRole('button', {
        name: /Continue to app/,
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
      const segmentMock = jest.fn()
      trackSegmentEvent.mockReturnValue(segmentMock)

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
        name: /Continue to app/,
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

      const selectLabel = await screen.findByText(
        /What org would you like to setup?/
      )
      expect(selectLabel).toBeInTheDocument()

      const selectOrg = screen.getByRole('button', {
        name: 'Select an organization',
      })
      await user.click(selectOrg)

      const orgInList = screen.getByRole('option', { name: 'criticalRole' })
      await user.click(orgInList)

      const submit = await screen.findByRole('button', {
        name: /Continue to app/,
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
})
