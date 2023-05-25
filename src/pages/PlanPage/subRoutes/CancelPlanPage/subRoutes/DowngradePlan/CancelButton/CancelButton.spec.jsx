import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { useCancelPlan } from 'services/account'
import { useAddNotification } from 'services/toastNotification'

import CancelButton from './CancelButton'
import { useBarecancel } from './useBarecancel'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))
jest.mock('./useBarecancel')
jest.mock('services/account')
jest.mock('services/toastNotification')

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
  function setup(baremetricsBlocked = false) {
    const user = userEvent.setup()
    const mutate = jest.fn()
    const addNotification = jest.fn()

    useAddNotification.mockReturnValue(addNotification)
    useParams.mockReturnValue({ owner: 'Ollie', provider: 'gh' })
    useCancelPlan.mockReturnValue({
      isLoading: false,
      mutate,
      onError: jest.fn(),
    })
    useBarecancel.mockReturnValue({ baremetricsBlocked })

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
      expect(downgradeButton).toHaveTextContent('Downgrade to basic')
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

      expect(
        screen.getByText(/Are you sure you want to cancel your plan?/)
      ).toBeInTheDocument()
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
          screen.queryByText(/Are you sure you want to cancel your plan?/)
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
        await user.click(screen.queryAllByRole('button', { name: /Close/ })[0])

        expect(
          screen.queryByText(/Are you sure you want to cancel your plan?/)
        ).not.toBeInTheDocument()
      })
    })

    describe('when unmounted', () => {
      it('removes the baremetrics script', async () => {
        const { user } = setup()
        const { unmount } = render(
          <CancelButton
            customerId="cus_1n4o328hn4"
            planCost="users-pr-inappy"
            upComingCancelation={false}
            currentPeriodEnd={1675361466}
          />,
          { wrapper }
        )

        await user.click(screen.getByTestId('downgrade-button'))

        unmount()

        expect(
          screen.queryByTestId('baremetrics-script')
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
