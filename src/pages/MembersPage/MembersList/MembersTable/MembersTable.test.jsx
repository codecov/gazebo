import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { Plans } from 'shared/utils/billing'

import MembersTable from './MembersTable'

const mocks = vi.hoisted(() => ({
  useImage: vi.fn(),
}))

vi.mock('services/image', async () => {
  const actual = await vi.importActual('services/image')
  return {
    ...actual,
    useImage: mocks.useImage,
  }
})

const mockBaseUserRequest = ({ student = false } = { student: false }) => ({
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      activated: false,
      isAdmin: false,
      username: 'codecov-user',
      email: 'user@codecov.io',
      ownerid: 1,
      student,
      name: 'codecov',
      lastPullTimestamp: null,
    },
  ],
  totalPages: 1,
})

const mockedFirstResponse = {
  count: 1,
  next: 'http://localhost/internal/users?page=2',
  previous: null,
  results: [
    {
      ownerid: 1,
      username: 'user1-codecov',
      email: 'user1@codecov.io',
      name: 'User 1',
      isAdmin: true,
      student: false,
      activated: false,
      lastPullTimestamp: null,
    },
  ],
  totalPages: 2,
}

const mockSecondResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      ownerid: 2,
      username: 'user2-codecov',
      email: 'user2@codecov.io',
      name: null,
      isAdmin: false,
      student: false,
      activated: true,
      lastPullTimestamp: null,
    },
  ],
  totalPages: 2,
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: Infinity,
    },
  },
})

const mockPlanData = {
  isEnterprisePlan: false,
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
}

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => { })
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('MembersTable', () => {
  let requestSearchParams

  const wrapper =
    (initialEntries = ['/gh/codecov']) =>
      ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={initialEntries}>
            <Route path="/:provider/:owner">{children}</Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

  function setup({
    mockUserRequest = mockBaseUserRequest(false),
    usePaginatedRequest = false,
    planName = Plans.USERS_BASIC,
    planUserCount = 0,
    hasSeatsLeft = false,
  }) {
    const user = userEvent.setup()
    mocks.useImage.mockReturnValue({ src: 'mocked-avatar-url' })
    server.use(
      http.get('/internal/:provider/codecov/users', (info) => {
        requestSearchParams = new URL(info.request.url).searchParams

        if (usePaginatedRequest) {
          const pageNum = Number(requestSearchParams.get('page'))
          if (pageNum > 1) {
            return HttpResponse.json(mockSecondResponse)
          }
          return HttpResponse.json(mockedFirstResponse)
        }

        return HttpResponse.json(mockUserRequest)
      }),
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: false,
              plan: {
                ...mockPlanData,
                value: planName,
                isFreePlan: planName === Plans.USERS_BASIC,
                planUserCount,
                hasSeatsLeft,
              },
            },
          },
        })
      })
    )

    return { user }
  }

  describe('rendering MembersTable', () => {
    beforeEach(() => setup({}))

    describe('renders table header', () => {
      it('has Username column', async () => {
        render(<MembersTable />, { wrapper: wrapper() })

        const userName = await screen.findByText('Username')
        expect(userName).toBeInTheDocument()
      })

      it('has Type column', async () => {
        render(<MembersTable />, { wrapper: wrapper() })

        const type = await screen.findByText('Type')
        expect(type).toBeInTheDocument()
      })

      it('has email column', async () => {
        render(<MembersTable />, { wrapper: wrapper() })

        const email = await screen.findByText('Email')
        expect(email).toBeInTheDocument()
      })

      it('has Activation status column', async () => {
        render(<MembersTable />, { wrapper: wrapper() })

        const activationStatus = await screen.findByText('Activation status')
        expect(activationStatus).toBeInTheDocument()
      })
    })

    describe('renders table entries', () => {
      describe('rendering Username column', () => {
        describe('user has name value set', () => {
          beforeEach(() =>
            setup({
              mockUserRequest: {
                ...mockBaseUserRequest(),
                results: [
                  {
                    ...mockBaseUserRequest().results[0],
                    name: 'codecov-name',
                  },
                ],
              },
            })
          )

          it('renders with name', async () => {
            render(<MembersTable />, { wrapper: wrapper() })

            const name = await screen.findByText('codecov-name')
            expect(name).toBeInTheDocument()
          })
        })

        describe('user does not have a name value set', () => {
          beforeEach(() => setup({}))

          it('renders with the username', async () => {
            render(<MembersTable />, { wrapper: wrapper() })

            const userName = await screen.findByText('codecov')
            expect(userName).toBeInTheDocument()
          })
        })
      })

      describe('rendering type column', () => {
        describe('user is an admin', () => {
          beforeEach(() =>
            setup({
              mockUserRequest: {
                ...mockBaseUserRequest(),
                results: [
                  {
                    ...mockBaseUserRequest().results[0],
                    is_admin: true,
                  },
                ],
              },
            })
          )

          it('renders admin', async () => {
            render(<MembersTable />, { wrapper: wrapper() })

            const admin = await screen.findByText('Admin')
            expect(admin).toBeInTheDocument()
          })
        })

        describe('user is not an admin', () => {
          beforeEach(() => setup({}))

          it('renders Developer', async () => {
            render(<MembersTable />, { wrapper: wrapper() })

            const developer = await screen.findByText('Developer')
            expect(developer).toBeInTheDocument()
          })
        })
      })

      describe('rendering email column', () => {
        beforeEach(() => setup({}))

        it('displays users email', async () => {
          render(<MembersTable />, { wrapper: wrapper() })

          const email = await screen.findByText('user@codecov.io')
          expect(email).toBeInTheDocument()
        })
      })

      describe('rendering activation status column', () => {
        describe('user is not on a free plan', () => {
          describe('there are no open seats', () => {
            beforeEach(() =>
              setup({
                planName: Plans.USERS_PR_INAPPY,
                hasSeatsLeft: false,
                planUserCount: 1,
              })
            )

            it('displays disabled toggle', async () => {
              render(<MembersTable />, { wrapper: wrapper() })

              await waitFor(() => queryClient.isFetching())
              await waitFor(() => !queryClient.isFetching())

              const toggle = await screen.findByRole('button')
              await waitFor(() => expect(toggle).toBeDisabled())
            })
          })

          describe('user is on a free plan', () => {
            describe('there are no open seats', () => {
              beforeEach(() =>
                setup({
                  planName: Plans.USERS_BASIC,
                  hasSeatsLeft: false,
                  planUserCount: 1,
                })
              )

              it('displays enabled toggle', async () => {
                render(<MembersTable />, { wrapper: wrapper() })

                const toggle = await screen.findByRole('button')
                expect(toggle).not.toBeDisabled()
              })
            })
          })

          describe('there are open seats', () => {
            beforeEach(() =>
              setup({
                planName: Plans.USERS_BASIC,
                hasSeatsLeft: true,
                planUserCount: 1,
              })
            )

            it('renders an non-disabled toggle', async () => {
              render(<MembersTable />, { wrapper: wrapper() })

              const toggle = await screen.findByRole('button')
              expect(toggle).not.toBeDisabled()
            })
          })
        })
      })
    })
  })
  describe('user interacts with toggle', () => {
    describe('user is not a student', () => {
      it('calls handleActivate', async () => {
        const { user } = setup({})
        const handleActivate = vi.fn()
        render(<MembersTable handleActivate={handleActivate} />, {
          wrapper: wrapper(),
        })

        const toggle = await screen.findByRole('button')
        await user.click(toggle)

        await waitFor(() =>
          expect(handleActivate).toHaveBeenCalledWith({
            activated: false,
            ownerid: 1,
          })
        )
      })
    })
    describe('user is a student and limit has been reached', () => {
      it('calls handleActivate', async () => {
        const { user } = setup({
          mockUserRequest: mockBaseUserRequest({ student: true }),
          planName: Plans.USERS_BASIC,
          planUserCount: 1,
          hasSeatsLeft: false,
        })
        const handleActivate = vi.fn()
        render(<MembersTable handleActivate={handleActivate} />, {
          wrapper: wrapper(),
        })

        const toggle = await screen.findByRole('button')
        await user.click(toggle)

        await waitFor(() =>
          expect(handleActivate).toHaveBeenCalledWith({
            activated: false,
            ownerid: 1,
          })
        )
      })
    })
  })

  describe('user interacts with table headers', () => {
    describe('interacting with the username column', () => {
      describe('setting in asc order', () => {
        it('updates the request params', async () => {
          const { user } = setup({})
          render(<MembersTable />, { wrapper: wrapper() })

          const userName = await screen.findByText('Username')
          await user.click(userName)

          await waitFor(() =>
            expect(requestSearchParams.get('ordering')).toBe('-username')
          )
        })
      })

      describe('setting in desc order', () => {
        it('updates the request params', async () => {
          const { user } = setup({})
          render(<MembersTable />, { wrapper: wrapper() })

          const userName = await screen.findByText('Username')

          await user.click(userName)
          await user.click(userName)
          await user.click(userName)

          await waitFor(() =>
            expect(requestSearchParams.get('ordering')).toBe('username')
          )
        })
      })

      describe('setting in originally order', () => {
        it('removes the request param', async () => {
          const { user } = setup({})
          render(<MembersTable />, { wrapper: wrapper() })

          const userName = await screen.findByText('Username')

          await user.click(userName)
          await user.click(userName)

          await waitFor(() =>
            expect(requestSearchParams.get('ordering')).toBe(null)
          )
        })
      })
    })

    describe('interacting with the email column', () => {
      describe('setting in asc order', () => {
        it('updates the request params', async () => {
          const { user } = setup({})
          render(<MembersTable />, { wrapper: wrapper() })

          const email = await screen.findByText('Email')

          await user.click(email)
          await user.click(email)

          await waitFor(() =>
            expect(requestSearchParams.get('ordering')).toBe('-email')
          )
        })
      })

      describe('setting in desc order', () => {
        it('updates the request params', async () => {
          const { user } = setup({})
          render(<MembersTable />, { wrapper: wrapper() })

          const email = await screen.findByText('Email')
          await user.click(email)

          await waitFor(() =>
            expect(requestSearchParams.get('ordering')).toBe('email')
          )
        })
      })

      describe('setting in originally order', () => {
        it('removes the request param', async () => {
          const { user } = setup({})
          render(<MembersTable />, { wrapper: wrapper() })

          const email = await screen.findByText('Email')
          await user.click(email)
          await user.click(email)
          await user.click(email)

          await waitFor(() =>
            expect(requestSearchParams.get('ordering')).toBe(null)
          )
        })
      })
    })

    describe('interacting with the activation status column', () => {
      describe('setting in asc order', () => {
        it('updates the request params', async () => {
          const { user } = setup({})
          render(<MembersTable />, { wrapper: wrapper() })

          const activationStatus = await screen.findByText('Activation status')
          await user.click(activationStatus)

          await waitFor(() =>
            expect(requestSearchParams.get('ordering')).toBe('-activated')
          )
        })
      })

      describe('setting in desc order', () => {
        it('updates the request params', async () => {
          const { user } = setup({})
          render(<MembersTable />, { wrapper: wrapper() })

          const activationStatus = await screen.findByText('Activation status')
          await user.click(activationStatus)
          await user.click(activationStatus)

          await waitFor(() =>
            expect(requestSearchParams.get('ordering')).toBe('activated')
          )
        })
      })

      describe('setting in originally order', () => {
        it('removes the request param', async () => {
          const { user } = setup({})
          render(<MembersTable />, { wrapper: wrapper() })

          const activationStatus = await screen.findByText('Activation status')
          await user.click(activationStatus)
          await user.click(activationStatus)
          await user.click(activationStatus)

          await waitFor(() =>
            expect(requestSearchParams.get('ordering')).toBe(null)
          )
        })
      })
    })
  })

  describe('triggering isIntersecting', () => {
    beforeEach(() => {
      setup({ usePaginatedRequest: true, isIntersecting: true })
    })

    it('displays two users', async () => {
      render(<MembersTable />, { wrapper: wrapper() })

      const user1 = await screen.findByText('User 1')
      expect(user1).toBeInTheDocument()

      await waitFor(() => expect(requestSearchParams.get('page')).toBe('1'))
      mockAllIsIntersecting(true)

      await waitFor(() => expect(requestSearchParams.get('page')).toBe('2'))
      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const user2 = await screen.findByText('user2-codecov')
      expect(user2).toBeInTheDocument()
    })
  })

  describe('when provider is not github', () => {
    describe('user does not have a username', () => {
      beforeEach(() => {
        setup({
          mockUserRequest: {
            ...mockBaseUserRequest(),
            results: [
              {
                ...mockBaseUserRequest().results[0],
                username: null,
              },
            ],
          },
        })
      })

      it('uses default author', async () => {
        render(<MembersTable />, { wrapper: wrapper(['/gl/codecov']) })

        const avatar = await screen.findByRole('img')
        await waitFor(() => expect(avatar).toBeInTheDocument())

        await waitFor(() =>
          expect(avatar).toHaveAttribute('src', 'mocked-avatar-url')
        )
      })
    })
  })
})
