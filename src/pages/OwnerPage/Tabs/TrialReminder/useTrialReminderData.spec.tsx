import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/trial'
import { useFlags } from 'shared/featureFlags'
import { Plans } from 'shared/utils/billing'

import { useTrialReminderData } from './useTrialReminderData'

jest.mock('shared/featureFlags')

const mockedUseFlags = useFlags as jest.Mock<{ codecovTrialMvp: boolean }>

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

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
  flagValue?: boolean
  planValue?: string
  trialStatus?: string
  trialStartDate?: string
  trialEndDate?: string
}

describe('useTrialReminderData', () => {
  function setup({
    flagValue = true,
    planValue = Plans.USERS_BASIC,
    trialStatus = TrialStatuses.NOT_STARTED,
    trialStartDate = '2023-01-01T08:55:25',
    trialEndDate = '2023-01-01T08:55:25',
  }: SetupArgs) {
    mockedUseFlags.mockReturnValue({
      codecovTrialMvp: flagValue,
    })

    server.use(
      graphql.query('GetTrialData', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: { plan: { trialStatus, trialStartDate, trialEndDate } },
          })
        )
      }),
      rest.get('/internal/gh/codecov/account-details/', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            plan: {
              value: planValue,
            },
          })
        )
      })
    )
  }

  describe('flag is enabled', () => {
    describe('user has not started a trial', () => {
      describe('user is on a free plan', () => {
        it('returns hideComponent as false', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.NOT_STARTED,
            trialStartDate: undefined,
            trialEndDate: undefined,
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.hideComponent).toBeFalsy())
        })

        it('returns trialNotStarted as true', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.NOT_STARTED,
            trialStartDate: undefined,
            trialEndDate: undefined,
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() =>
            expect(result.current.trialNotStarted).toBeTruthy()
          )
        })

        it('returns trialOngoing as false', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.NOT_STARTED,
            trialStartDate: undefined,
            trialEndDate: undefined,
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.trialOngoing).toBeFalsy())
        })

        it('returns trialExpired as false', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.NOT_STARTED,
            trialStartDate: undefined,
            trialEndDate: undefined,
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.trialExpired).toBeFalsy())
        })
      })

      describe('user is not on a free plan', () => {
        it('returns hideComponent as true', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            trialStatus: TrialStatuses.NOT_STARTED,
            trialStartDate: undefined,
            trialEndDate: undefined,
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.hideComponent).toBeTruthy())
        })

        it('returns trialNotStarted as true', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            trialStatus: TrialStatuses.NOT_STARTED,
            trialStartDate: undefined,
            trialEndDate: undefined,
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() =>
            expect(result.current.trialNotStarted).toBeTruthy()
          )
        })

        it('returns trialOngoing as false', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            trialStatus: TrialStatuses.NOT_STARTED,
            trialStartDate: undefined,
            trialEndDate: undefined,
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.trialOngoing).toBeFalsy())
        })

        it('returns trialExpired as false', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            trialStatus: TrialStatuses.NOT_STARTED,
            trialStartDate: undefined,
            trialEndDate: undefined,
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.trialExpired).toBeFalsy())
        })
      })
    })

    describe('user has started a trial', () => {
      describe('it is within 4 days remaining on the trial', () => {
        it('returns hideComponent as false', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-10T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.hideComponent).toBeFalsy())
        })

        it('returns trialNotStarted as false', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-10T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() =>
            expect(result.current.trialNotStarted).toBeFalsy()
          )
        })

        it('returns trialOngoing as true', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-10T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.trialOngoing).toBeTruthy())
        })

        it('returns trialExpired as false', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-10T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.trialExpired).toBeFalsy())
        })

        it('returns dateDiff is 9', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-10T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.dateDiff).toBe(9))
        })
      })

      describe('it is within 3 days remaining on the trial', () => {
        it('returns hideComponent as true', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.hideComponent).toBeTruthy())
        })

        it('returns trialNotStarted as false', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() =>
            expect(result.current.trialNotStarted).toBeFalsy()
          )
        })

        it('returns trialOngoing as false', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.trialOngoing).toBeFalsy())
        })

        it('returns trialExpired as false', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.trialExpired).toBeFalsy())
        })

        it('returns dateDiff is 1', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.dateDiff).toBe(1))
        })
      })
    })

    describe('user has finished the trial', () => {
      describe('user is on a free plan', () => {
        it('returns hideComponent as false', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.EXPIRED,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.hideComponent).toBeFalsy())
        })

        it('returns trialNotStarted as false', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.EXPIRED,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() =>
            expect(result.current.trialNotStarted).toBeFalsy()
          )
        })

        it('returns trialOngoing as false', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.EXPIRED,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.trialOngoing).toBeFalsy())
        })

        it('returns trialExpired as true', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.EXPIRED,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.trialExpired).toBeTruthy())
        })
      })

      describe('user is not on a free plan', () => {
        it('returns hideComponent as true', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            trialStatus: TrialStatuses.EXPIRED,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.hideComponent).toBeTruthy())
        })

        it('returns trialNotStarted as false', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            trialStatus: TrialStatuses.EXPIRED,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() =>
            expect(result.current.trialNotStarted).toBeFalsy()
          )
        })

        it('returns trialOngoing as false', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            trialStatus: TrialStatuses.EXPIRED,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.trialOngoing).toBeFalsy())
        })

        it('returns trialExpired as false', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            trialStatus: TrialStatuses.EXPIRED,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { result } = renderHook(() => useTrialReminderData(), {
            wrapper,
          })

          await waitFor(() => expect(result.current.trialExpired).toBeFalsy())
        })
      })
    })
  })

  describe('flag is not enabled', () => {
    it('returns hideComponent true', async () => {
      setup({ flagValue: false })

      const { result } = renderHook(() => useTrialReminderData(), { wrapper })

      await waitFor(() => expect(result.current.hideComponent).toBeTruthy())
    })
  })
})
