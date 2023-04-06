import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Plans } from 'shared/utils/billing'

import TotalBanner from './TotalBanner'

describe('TotalBanner', () => {
  afterEach(() => jest.resetAllMocks())

  function setup() {
    const user = userEvent.setup()
    const mockSetValue = jest.fn()

    return { mockSetValue, user }
  }

  describe('isPerYear is set to true', () => {
    const props = {
      isPerYear: true,
      perYearPrice: 100,
      perMonthPrice: 120,
      isSentryUpgrade: false,
    }

    it('displays per month price', () => {
      const { mockSetValue } = setup()

      render(<TotalBanner {...props} setValue={mockSetValue} />)

      const perMonthPrice = screen.getByText(/\$100.00/)
      expect(perMonthPrice).toBeInTheDocument()
    })

    it('displays billed annually at price', () => {
      const { mockSetValue } = setup()

      render(<TotalBanner {...props} setValue={mockSetValue} />)

      const annualPrice = screen.getByText(/\$1,200.00/)
      expect(annualPrice).toBeInTheDocument()
    })

    it('displays how much the user saves', () => {
      const { mockSetValue } = setup()

      render(<TotalBanner {...props} setValue={mockSetValue} />)

      const moneySaved = screen.getByText(/\$240.00/)
      expect(moneySaved).toBeInTheDocument()
    })
  })

  describe('isPerYear is set to false', () => {
    const props = {
      isPerYear: false,
      perYearPrice: 100,
      perMonthPrice: 120,
      isSentryUpgrade: false,
    }

    it('displays the monthly price', () => {
      const { mockSetValue } = setup()
      render(<TotalBanner {...props} setValue={mockSetValue} />)

      const monthlyPrice = screen.getByText(/\$120.00/)
      expect(monthlyPrice).toBeInTheDocument()
    })

    it('displays what the user could save with annual plan', () => {
      const { mockSetValue } = setup()
      render(<TotalBanner {...props} setValue={mockSetValue} />)

      const savings = screen.getByText(/\$240.00/)
      expect(savings).toBeInTheDocument()
    })

    describe('user switches to annual plan', () => {
      describe('user can apply sentry upgrade', () => {
        it('calls mockSetValue with sentry annual plan', async () => {
          const { mockSetValue } = setup()
          render(
            <TotalBanner
              {...props}
              isSentryUpgrade={true}
              setValue={mockSetValue}
            />
          )

          const switchToAnnual = screen.getByRole('button', {
            name: 'switch to annual',
          })
          expect(switchToAnnual).toBeInTheDocument()

          await userEvent.click(switchToAnnual)

          expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_SENTRYY)
        })
      })

      describe('user cannot apply sentry upgrade', () => {
        it('calls mock set value with pro annual plan', async () => {
          const { mockSetValue } = setup()
          render(
            <TotalBanner
              {...props}
              isSentryUpgrade={false}
              setValue={mockSetValue}
            />
          )

          const switchToAnnual = screen.getByRole('button', {
            name: 'switch to annual',
          })
          expect(switchToAnnual).toBeInTheDocument()

          await userEvent.click(switchToAnnual)

          expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_PR_INAPPY)
        })
      })
    })
  })
})
