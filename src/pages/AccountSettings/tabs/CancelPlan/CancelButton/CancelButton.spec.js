import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import CancelButton from './CancelButton'
import { useCancel } from './hooks'

jest.mock('./hooks')

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
  const cancelPlanMock = jest.fn()

  function setup(props = defaultProps, baremetricsBlocked = false) {
    useCancel.mockReturnValue({
      cancelPlan: cancelPlanMock,
      baremetricsBlocked: baremetricsBlocked,
      queryIsLoading: false,
    })

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/account/gh/codecov/billing/cancel']}>
          <CancelButton {...props} />
          <Route
            path="*"
            render={({ location }) => {
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

    it('calls the completeCancelation function', () => {
      expect(cancelPlanMock).toHaveBeenCalled()
    })

    // it('redirects the user to the billing page', () => {
    //   expect(testLocation.pathname).toEqual('/account/gh/codecov/billing')
    // })
  })

  // describe('when mutation is not successful', () => {
  //   beforeEach(() => {
  //     setup()
  //     userEvent.click(screen.getByRole('button', { name: /Downgrade to Free/ }))
  //     userEvent.click(screen.getByRole('button', { name: /Cancel/ }))
  //     // simulating the onError callback given to mutate
  //     mutate.mock.calls[0][1].onError()
  //   })

  //   it('adds an error notification', () => {
  //     expect(addNotification).toHaveBeenCalledWith({
  //       type: 'error',
  //       text: 'Something went wrong',
  //     })
  //   })
  // })
})

//   describe('when clicking the X icon', () => {
//     beforeEach(() => {
//       userEvent.click(screen.queryAllByRole('button', { name: /Close/ })[0])
//     })

//     it('closes the modal', () => {
//       expect(
//         screen.queryByText(/Are you sure you want to cancel your plan?/)
//       ).not.toBeInTheDocument()
//     })
//   })
