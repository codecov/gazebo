import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import CancelButton from './CancelButton'

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  useCancelPlan: vi.fn(),
  useAddNotification: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual, // import and retain the original functionalities
    useParams: mocks.useParams,
  }
})

vi.mock('services/account/useCancelPlan', async () => {
  const actual = await vi.importActual('services/account/useCancelPlan')
  return {
    ...actual,
    useCancelPlan: mocks.useCancelPlan,
  }
})

vi.mock('services/toastNotification/context', async () => {
  const actual = await vi.importActual('services/toastNotification/context')
  return {
    ...actual,
    useAddNotification: mocks.useAddNotification,
  }
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

let testLocation

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/gh/codecov/cancel']}>
      {children}
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

describe('CancelButton', () => {
  function setup() {
    const user = userEvent.setup()
    const mutate = vi.fn()
    const addNotification = vi.fn()

    mocks.useAddNotification.mockReturnValue(addNotification)
    mocks.useParams.mockReturnValue({ owner: 'Ollie', provider: 'gh' })
    mocks.useCancelPlan.mockReturnValue({
      isLoading: false,
      mutate,
      onError: vi.fn(),
    })

    return { mutate, addNotification, user }
  }

  describe('when button is rendered', () => {
    beforeEach(() => setup())

    it('renders button text', () => {
      render(
        <CancelButton
          customerId="cus_1n4o328hn4"
          planCost="users-pr-inappy"
          upComingCancelation={false}
          currentPeriodEnd={1675361466}
        />,
        { wrapper }
      )

      const downgradeButton = screen.getByTestId('downgrade-button')
      expect(downgradeButton).toBeInTheDocument()
      expect(downgradeButton).toHaveTextContent('Cancel your plan')
    })
  })

  describe('when clicking on the button to downgrade', () => {
    it('opens the modal with warning', async () => {
      const { user } = setup()
      render(
        <CancelButton
          customerId="cus_1n4o328hn4"
          planCost="users-pr-inappy"
          upComingCancelation={false}
          currentPeriodEnd={1675361466}
        />,
        { wrapper }
      )

      await user.click(screen.getByTestId('downgrade-button'))

      expect(screen.getByText(/Review plan cancellation/)).toBeInTheDocument()
    })

    describe('when clicking cancel', () => {
      it('closes the modal', async () => {
        const { user } = setup()
        render(
          <CancelButton
            customerId="cus_1n4o328hn4"
            planCost="users-pr-inappy"
            upComingCancelation={false}
            currentPeriodEnd={1675361466}
          />,
          { wrapper }
        )

        await user.click(screen.getByTestId('downgrade-button'))
        await user.click(screen.getByTestId('close-button'))

        expect(
          screen.queryByText(/Review plan cancellation/)
        ).not.toBeInTheDocument()
      })
    })

    describe('when clicking the X icon', () => {
      it('closes the modal', async () => {
        const { user } = setup()
        render(
          <CancelButton
            customerId="cus_1n4o328hn4"
            planCost="users-pr-inappy"
            upComingCancelation={false}
            currentPeriodEnd={1675361466}
          />,
          { wrapper }
        )

        await user.click(screen.getByTestId('downgrade-button'))
        await user.click(screen.getByLabelText('Close'))

        expect(
          screen.queryByText(/Review plan cancellation/)
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('when clicking submit', () => {
    it('calls the cancelPlan/mutate function', async () => {
      const { mutate, user } = setup(true)
      render(
        <CancelButton
          customerId="cus_1n4o328hn4"
          planCost="users-pr-inappy"
          upComingCancelation={false}
          currentPeriodEnd={1675361466}
        />,
        { wrapper }
      )

      await user.click(screen.getByTestId('downgrade-button'))
      await user.click(screen.getByTestId('continue-cancellation-button'))

      expect(mutate).toHaveBeenCalled()
    })

    describe('on a failure', () => {
      it('calls the cancelPlan function', async () => {
        const { mutate, addNotification, user } = setup(true)
        render(
          <CancelButton
            customerId="cus_1n4o328hn4"
            planCost="users-pr-inappy"
            upComingCancelation={false}
            currentPeriodEnd={1675361466}
          />,
          { wrapper }
        )

        await user.click(screen.getByTestId('downgrade-button'))
        await user.click(screen.getByTestId('continue-cancellation-button'))

        mutate.mock.calls[0][1].onError()

        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'Something went wrong, we were unable to cancel your plan. Please reach out to support.',
        })
      })
    })

    describe('on a submit', () => {
      it('redirects the user to the billing page', async () => {
        const { mutate, user } = setup(true)
        render(
          <CancelButton
            customerId="cus_1n4o328hn4"
            planCost="users-pr-inappy"
            upComingCancelation={false}
            currentPeriodEnd={1675361466}
          />,
          { wrapper }
        )

        await user.click(screen.getByTestId('downgrade-button'))
        await user.click(screen.getByTestId('continue-cancellation-button'))

        act(() => {
          mutate.mock.calls[0][1].onSuccess()
        })

        expect(testLocation.pathname).toEqual('/plan/gh/Ollie')
      })
    })
  })
})
