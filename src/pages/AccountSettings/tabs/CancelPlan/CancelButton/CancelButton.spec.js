import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from 'react-query'
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

const defaultProps = {
  customerId: 'cus_1n4o328hn4',
  planCost: 'users-pr-inappy',
  upComingCancelation: false,
  currentPeriodEnd: 1675361466,
}

describe('CancelButton', () => {
  let mutate
  let testLocation
  const addNotification = jest.fn()

  function setup(props = defaultProps, baremetricsBlocked = false) {
    mutate = jest.fn()
    useAddNotification.mockReturnValue(addNotification)
    useParams.mockReturnValue({ owner: 'Ollie', provider: 'gh' })
    useCancelPlan.mockReturnValue({
      isLoading: false,
      mutate,
      onError: jest.fn(),
    })
    useBarecancel.mockReturnValue({ baremetricsBlocked })

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/account/gh/codecov/billing/cancel']}>
          <CancelButton {...props} />
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

    return { unmount }
  }

  describe('when button is rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders button text', () => {
      const downgradeButton = screen.getByTestId('downgrade-button')
      expect(downgradeButton).toBeInTheDocument()
      expect(downgradeButton).toHaveTextContent('Downgrade to Free')
    })
  })

  describe('when clicking on the button to downgrade', () => {
    beforeEach(() => {
      setup()
      userEvent.click(screen.getByTestId('downgrade-button'))
    })

    it('opens the modal with warning', () => {
      expect(
        screen.getByText(/Are you sure you want to cancel your plan?/)
      ).toBeInTheDocument()
    })

    describe('when clicking cancel', () => {
      beforeEach(() => {
        userEvent.click(screen.getByTestId('close-button'))
      })

      it('closes the modal', () => {
        expect(
          screen.queryByText(/Are you sure you want to cancel your plan?/)
        ).not.toBeInTheDocument()
      })
    })

    describe('when clicking the X icon', () => {
      beforeEach(() => {
        userEvent.click(screen.queryAllByRole('button', { name: /Close/ })[0])
      })

      it('closes the modal', () => {
        expect(
          screen.queryByText(/Are you sure you want to cancel your plan?/)
        ).not.toBeInTheDocument()
      })
    })

    describe('when unmounted', () => {
      beforeEach(() => {
        const { unmount } = setup()
        unmount()
      })

      it('removes the baremetrics script', () => {
        expect(
          screen.queryByTestId('baremetrics-script')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('when clicking submit', () => {
    beforeEach(() => {
      setup(defaultProps, true)
      userEvent.click(screen.getByTestId('downgrade-button'))
      userEvent.click(screen.getByTestId('continue-cancellation-button'))
    })

    it('calls the cancelPlan/mutate function', () => {
      expect(mutate).toHaveBeenCalled()
    })

    describe('on a failure', () => {
      beforeEach(() => {
        mutate.mock.calls[0][1].onError()
      })

      it('calls the cancelPlan function', () => {
        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'Something went wrong, we were unable to cancel your plan. Please reach out to support.',
        })
      })
    })

    describe('on a submit', () => {
      beforeEach(() => {
        mutate.mock.calls[0][1].onSuccess()
      })

      it('redirects the user to the billing page', () => {
        expect(testLocation.pathname).toEqual('/account/gh/Ollie/billing')
      })
    })
  })
})
