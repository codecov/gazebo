import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import PlanDetailsControls from './PlanDetailsControls'

const proPlanMonth = {
  marketingName: 'Pro Team',
  value: 'users-pr-inappm',
  billingRate: 'monthly',
  baseUnitPrice: 12,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: 250,
}

const proPlanYear = {
  marketingName: 'Pro Team',
  value: 'users-pr-inappy',
  billingRate: 'annually',
  baseUnitPrice: 10,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: 250,
}

const teamPlanMonth = {
  baseUnitPrice: 6,
  benefits: ['Up to 10 users'],
  billingRate: 'monthly',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamm',
}

const teamPlanYear = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: 'annually',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamy',
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">
        <Suspense fallback={null}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

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

describe('PlanDetailsControls', () => {
  function setup() {
    server.use(
      graphql.query('GetAvailablePlans', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              availablePlans: [
                proPlanMonth,
                proPlanYear,
                teamPlanMonth,
                teamPlanYear,
              ],
            },
          })
        )
      })
    )

    const mockSetValue = jest.fn()
    const mockSetSelectedPlan = jest.fn()
    const user = userEvent.setup()

    return { user, mockSetValue, mockSetSelectedPlan }
  }

  describe('When rendering the Plan Details Controls for the Pro Controller', () => {
    it('renders Pro button as "selected"', async () => {
      const { mockSetValue, mockSetSelectedPlan } = setup()

      render(
        <PlanDetailsControls
          setValue={mockSetValue}
          setSelectedPlan={mockSetSelectedPlan}
        />,
        {
          wrapper,
        }
      )

      const proBtn = await screen.findByRole('button', {
        name: 'Pro',
      })
      expect(proBtn).toBeInTheDocument()
      expect(proBtn).toHaveClass('bg-ds-primary-base')

      const teamBtn = await screen.findByRole('button', {
        name: 'Team',
      })
      expect(teamBtn).toBeInTheDocument()
      expect(teamBtn).not.toHaveClass('bg-ds-primary-base')
    })

    describe('user clicks Team button', () => {
      it('calls setValue and setSelectedPlan', async () => {
        const { user, mockSetValue, mockSetSelectedPlan } = setup()

        render(
          <PlanDetailsControls
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
          />,
          {
            wrapper,
          }
        )

        const teamBtn = await screen.findByRole('button', {
          name: 'Team',
        })
        expect(teamBtn).toBeInTheDocument()
        await user.click(teamBtn)

        await waitFor(() =>
          expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_TEAMY)
        )
        await waitFor(() =>
          expect(mockSetSelectedPlan).toBeCalledWith(teamPlanYear)
        )
      })
    })

    describe('user clicks Pro button', () => {
      it('calls setValue and setSelectedPlan', async () => {
        const { user, mockSetValue, mockSetSelectedPlan } = setup()

        render(
          <PlanDetailsControls
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
          />,
          {
            wrapper,
          }
        )

        const proBtn = await screen.findByRole('button', {
          name: 'Pro',
        })
        expect(proBtn).toBeInTheDocument()
        await user.click(proBtn)

        await waitFor(() =>
          expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_PR_INAPPY)
        )
        await waitFor(() =>
          expect(mockSetSelectedPlan).toBeCalledWith(proPlanYear)
        )
      })
    })
  })
})
