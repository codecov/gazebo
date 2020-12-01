import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook, act } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'

import {
  useAccountDetails,
  useAccountsAndPlans,
  useCancelPlan,
  useUpgradePlan,
} from './hooks'

const provider = 'gh'
const owner = 'codecov'

const accountDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configureable # of users', 'Unlimited repos'],
    quantity: 5,
    value: 'users-inappm',
  },
  activatedUserCount: 2,
  inactiveUserCount: 1,
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useAccountDetails', () => {
  let hookData

  function setup() {
    server.use(
      rest.get(
        `/internal/${provider}/${owner}/account-details/`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(accountDetails))
        }
      )
    )
    hookData = renderHook(() => useAccountDetails({ provider, owner }))
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual(accountDetails)
      })
    })
  })
})

describe('useAccountsAndPlans', () => {
  let hookData

  function setup(currentUrl) {
    server.use(
      rest.get(
        `/internal/${provider}/${owner}/account-details/`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(accountDetails))
        }
      ),
      rest.get(`/internal/plans`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(getPlans()))
      })
    )
    hookData = renderHook(() => useAccountsAndPlans({ provider, owner }))
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual({
          accountDetails,
          plans: getPlans(),
        })
      })
    })
  })
})

describe('useCancelPlan', () => {
  let hookData

  function setup(currentUrl) {
    server.use(
      rest.patch(
        `/internal/${provider}/${owner}/account-details/`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(accountDetails))
        }
      )
    )
    hookData = renderHook(() => useCancelPlan({ provider, owner }))
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading false', () => {
      expect(hookData.result.current[1].isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      beforeEach(() => {
        act(() => {
          hookData.result.current[0]()
        })
      })

      it('returns isLoading true', () => {
        expect(hookData.result.current[1].isLoading).toBeTruthy()
      })
    })
  })
})

describe('useUpgradePlan', () => {
  let hookData, redirectToCheckout

  function setupStripe() {
    redirectToCheckout = jest.fn().mockResolvedValue()
    window['Stripe'] = jest.fn(() => ({
      redirectToCheckout,
    }))
  }

  function setup(currentUrl) {
    setupStripe()
    hookData = renderHook(() => useUpgradePlan({ provider, owner }))
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading false', () => {
      expect(hookData.result.current[1].isLoading).toBeFalsy()
    })

    describe('when calling the mutation, which return a checkoutSessionId', () => {
      beforeEach(() => {
        server.use(
          rest.patch(
            `/internal/${provider}/${owner}/account-details/`,
            (req, res, ctx) => {
              return res(
                ctx.status(200),
                ctx.json({
                  ...accountDetails,
                  checkoutSessionId: '1234',
                })
              )
            }
          )
        )
        return act(() => {
          return hookData.result.current[0]({
            seats: 12,
            newPlan: {
              value: 'users-pr-inappy',
            },
          })
        })
      })

      it('calls redirectToCheckout on the Stripe client', () => {
        return waitFor(() => {
          expect(redirectToCheckout).toHaveBeenCalledWith({
            sessionId: '1234',
          })
        })
      })
    })

    describe('when calling the mutation, which doesnt return a checkoutSessionId', () => {
      beforeEach(() => {
        server.use(
          rest.patch(
            `/internal/${provider}/${owner}/account-details/`,
            (req, res, ctx) => {
              return res(
                ctx.status(200),
                ctx.json({
                  ...accountDetails,
                  checkoutSessionId: null,
                })
              )
            }
          )
        )
        return act(() =>
          hookData.result.current[0]({
            seats: 12,
            newPlan: {
              value: 'users-pr-inappy',
            },
          })
        )
      })

      it('doesnt call redirectToCheckout on the Stripe client', () => {
        expect(redirectToCheckout).not.toHaveBeenCalled()
      })
    })
  })
})

function getPlans() {
  return [
    {
      marketingName: 'Basic',
      value: 'users-free',
      billingRate: null,
      basUnitprice: 0,
      benefits: [
        'Up to 5 users',
        'Unlimited public repositories',
        'Unlimited private repositories',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-pr-inappm',
      billingRate: 'monthly',
      baseUnitPrice: 12,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-pr-inappy',
      billingRate: 'annually',
      baseUnitPrice: 10,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
  ]
}
