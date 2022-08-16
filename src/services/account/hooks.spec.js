import { useStripe } from '@stripe/react-stripe-js'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import Cookie from 'js-cookie'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'

import { useFlags } from 'shared/featureFlags'

import {
  useAccountDetails,
  useAutoActivate,
  useCancelPlan,
  useEraseAccount,
  useInvoice,
  useInvoices,
  usePlans,
  useUpdateCard,
  useUpgradePlan,
} from './hooks'

jest.mock('@stripe/react-stripe-js')
jest.mock('js-cookie')
jest.mock('shared/featureFlags')

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const provider = 'gh'
const owner = 'codecov'

const accountDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
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
    hookData = renderHook(() => useAccountDetails({ provider, owner }), {
      wrapper,
    })
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

describe('useInvoices', () => {
  let hookData

  const invoices = [
    { total: 2400, number: 1, created: 1607078662, dueDate: 1607078662 },
    { total: 2500, number: 2, created: 1604486662, dueDate: 1604486662 },
  ]

  function setup() {
    server.use(
      rest.get(`/internal/${provider}/${owner}/invoices/`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(invoices))
      })
    )
    hookData = renderHook(() => useInvoices({ provider, owner }), {
      wrapper,
    })
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
        expect(hookData.result.current.data).toEqual(invoices)
      })
    })
  })
})

describe('useInvoice', () => {
  let hookData

  const id = 'in_1234567'
  const invoice = {
    total: 2400,
    number: 1,
    created: 1607078662,
    dueDate: 1607078662,
  }

  function setup() {
    server.use(
      rest.get(
        `/internal/${provider}/${owner}/invoices/${id}`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(invoice))
        }
      )
    )
    hookData = renderHook(() => useInvoice({ provider, owner, id }), {
      wrapper,
    })
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
        expect(hookData.result.current.data).toEqual(invoice)
      })
    })
  })
})

describe('usePlans', () => {
  let hookData

  function setup(currentUrl) {
    server.use(
      rest.get(`/internal/plans`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(getPlans()))
      })
    )
    hookData = renderHook(() => usePlans(provider), {
      wrapper,
    })
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
        expect(hookData.result.current.data).toEqual(getPlans())
      })
    })
  })
})

describe('useCancelPlan', () => {
  let hookData

  function setup(flagValue = false) {
    server.use(
      rest.patch(
        `/internal/${provider}/${owner}/account-details/`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(accountDetails))
        }
      )
    )
    useFlags.mockReturnValue({
      planCancelationFlow: flagValue,
    })

    hookData = renderHook(() => useCancelPlan({ provider, owner }), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading false', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      beforeEach(() => {
        return waitFor(() => {
          hookData.result.current.mutate()
          return hookData.waitFor(
            () => hookData.result.current.status !== 'idle'
          )
        })
      })

      it('returns isLoading true', () => {
        expect(hookData.result.current.isLoading).toBeTruthy()
      })
    })
  })

  describe('with cancel flow setting org to a basic plan', () => {
    beforeEach(() => {
      setup(true)
    })

    describe('when calling the mutation', () => {
      beforeEach(() => {
        return waitFor(() => {
          hookData.result.current.mutate()
          return hookData.waitFor(
            () => hookData.result.current.status !== 'idle'
          )
        })
      })

      it('returns isLoading true', () => {
        expect(hookData.result.current.isLoading).toBeTruthy()
      })
    })
  })
})

describe('useUpgradePlan', () => {
  let hookData, redirectToCheckout

  function setupStripe() {
    redirectToCheckout = jest.fn().mockResolvedValue()
    useStripe.mockReturnValue({
      redirectToCheckout,
    })
  }

  function setup(currentUrl) {
    setupStripe()
    hookData = renderHook(() => useUpgradePlan({ provider, owner }), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading false', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
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
        return waitFor(async () => {
          hookData.result.current.mutate({
            seats: 12,
            newPlan: {
              value: 'users-pr-inappy',
            },
          })
          // one wait for isLoading: true, one for isLoading: false
          await hookData.waitFor(() => hookData.result.current.isLoading)
          await hookData.waitFor(() => !hookData.result.current.isLoading)
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
        return waitFor(() => {
          hookData.result.current.mutate({
            seats: 12,
            newPlan: {
              value: 'users-pr-inappy',
            },
          })
          return hookData.waitFor(() => hookData.result.current.isSuccess)
        })
      })

      it('doesnt call redirectToCheckout on the Stripe client', () => {
        expect(redirectToCheckout).not.toHaveBeenCalled()
      })
    })
  })
})

describe('useUpdateCard', () => {
  let hookData, createPaymentMethod, resolver

  const card = {
    last4: '1234',
  }

  function setupStripe() {
    createPaymentMethod = jest.fn(() => {
      return new Promise((yes, _) => {
        resolver = yes
      })
    })
    useStripe.mockReturnValue({
      createPaymentMethod,
    })
  }

  function setup(currentUrl) {
    setupStripe()
    hookData = renderHook(() => useUpdateCard({ provider, owner }), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading false', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      beforeEach(() => {
        server.use(
          rest.patch(
            `/internal/${provider}/${owner}/account-details/update_payment`,
            (req, res, ctx) => {
              return res(ctx.status(200), ctx.json(accountDetails))
            }
          )
        )
        return waitFor(() => {
          hookData.result.current.mutate(card)
          return hookData.waitFor(() => hookData.result.current.isLoading)
        })
      })

      it('calls createPaymentMethod on the Stripe client', () => {
        expect(createPaymentMethod).toHaveBeenCalledWith({
          type: 'card',
          card,
        })
      })

      describe('when payment method has error', () => {
        const error = {
          message: 'not good',
        }
        beforeEach(() => {
          return waitFor(() => {
            const spy = jest.spyOn(console, 'error')
            spy.mockImplementation(jest.fn())
            resolver({ error })
            return hookData.waitFor(() => hookData.result.current.error)
          })
        })

        it('does something', () => {
          expect(hookData.result.current.error).toEqual(error)
        })
      })

      describe('when payment method is good', () => {
        beforeEach(() => {
          return waitFor(() => {
            resolver({
              paymentMethod: {
                id: 1,
              },
            })
            return hookData.waitFor(() => hookData.result.current.isSuccess)
          })
        })

        it('returns the data from the server', () => {
          expect(hookData.result.current.data).toEqual(accountDetails)
        })
      })
    })
  })
})

describe('useEraseAccount', () => {
  let hookData

  function setup(currentUrl) {
    server.use(
      rest.delete(
        `/internal/${provider}/${owner}/account-details/`,
        (req, res, ctx) => {
          return res(ctx.status(204), null)
        }
      )
    )
    hookData = renderHook(() => useEraseAccount({ provider, owner }), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading false', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      beforeEach(() => {
        return waitFor(() => {
          hookData.result.current.mutate()
          return hookData.waitFor(
            () => hookData.result.current.status !== 'idle'
          )
        })
      })

      it('returns isLoading true', () => {
        expect(hookData.result.current.isLoading).toBeTruthy()
      })

      describe('when success', () => {
        beforeEach(() => {
          return waitFor(async () => {
            await hookData.waitFor(
              () => hookData.result.current.status !== 'idle'
            )
            await hookData.waitFor(() => hookData.result.current.isSuccess)
          })
        })

        it('returns isLoading false', () => {
          expect(hookData.result.current.isLoading).toBeFalsy()
        })

        it('deletes the auth cookie', () => {
          expect(Cookie.remove).toHaveBeenCalledWith('github-token')
        })
      })
    })
  })
})

describe('useAutoActivate', () => {
  let hookData
  let onSuccess = jest.fn()

  describe('options is set', () => {
    function setup() {
      const opts = {
        onSuccess,
      }
      server.use(
        rest.patch(
          `/internal/${provider}/${owner}/account-details/`,
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.json({}))
          }
        )
      )
      hookData = renderHook(() => useAutoActivate({ provider, owner, opts }), {
        wrapper,
      })
    }

    describe('when called', () => {
      beforeEach(() => {
        setup()
        return waitFor(() => {
          hookData.result.current.mutate(true)
          return hookData.waitFor(() => hookData.result.current.isSuccess)
        })
      })

      it('opts are passed through to react-query', () => {
        expect(onSuccess).toHaveBeenCalledTimes(1)
      })

      it('accountDetails cache unchanged', () => {
        expect(queryClient.isFetching('accountDetails')).toBe(0)
      })

      it('users cache unchanged', () => {
        expect(queryClient.isFetching('users')).toBe(0)
      })
    })
  })
  describe('opts is not set', () => {
    function setup() {
      server.use(
        rest.patch(
          `/internal/${provider}/${owner}/account-details/`,
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.json({}))
          }
        )
      )
      hookData = renderHook(() => useAutoActivate({ provider, owner }), {
        wrapper,
      })
    }

    describe('when called', () => {
      beforeEach(() => {
        setup()
        return waitFor(() => {
          hookData.result.current.mutate(true)
          return hookData.waitFor(() => hookData.result.current.isSuccess)
        })
      })

      it('accountDetails cache unchanged', () => {
        expect(queryClient.isFetching('accountDetails')).toBe(0)
      })

      it('users cache unchanged', () => {
        expect(queryClient.isFetching('users')).toBe(0)
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
        'Configurable # of users',
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
        'Configurable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-enterprisem',
      billingRate: 'monthly',
      baseUnitPrice: 12,
      benefits: [
        'Configurable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-enterprisey',
      billingRate: 'annually',
      baseUnitPrice: 10,
      benefits: [
        'Configurable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
  ]
}
