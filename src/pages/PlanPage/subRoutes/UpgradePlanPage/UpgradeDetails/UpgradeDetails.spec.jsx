import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import UpgradeDetails from './UpgradeDetails'

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
  quantity: 10,
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
  quantity: 10,
}

const sentryPlanMonth = {
  marketingName: 'Sentry Pro Team',
  value: 'users-sentrym',
  billingRate: 'monthly',
  baseUnitPrice: 12,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  trialDays: 14,
}

const sentryPlanYear = {
  marketingName: 'Sentry Pro Team',
  value: 'users-sentryy',
  billingRate: 'annually',
  baseUnitPrice: 10,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  trialDays: 14,
}

const freePlan = {
  marketingName: 'Basic',
  value: 'users-free',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Up to 5 users',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
}

const wrapper =
  (initialEntries = '/plan/gh') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/plan/:provider">{children}</Route>
      </MemoryRouter>
    )

describe('UpgradeDetails', () => {
  describe('users can apply sentry plan', () => {
    const plan = sentryPlanMonth
    const plans = [plan]
    const organizationName = 'codecov'
    const accountDetails = {
      activatedUserCount: 5,
      subscriptionDetail: { cancelAtPeriodEnd: false },
    }

    it('renders correct image', () => {
      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          organizationName={organizationName}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const image = screen.getByRole('img', { name: 'sentry codecov logos' })
      expect(image).toBeInTheDocument()
    })

    it('renders marketing name', () => {
      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          organizationName={organizationName}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const marketingName = screen.getByRole('heading', {
        name: 'Sentry Pro Team',
      })
      expect(marketingName).toBeInTheDocument()
    })

    it('renders 29.99 monthly bundle', () => {
      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          organizationName={organizationName}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const price = screen.getByRole('heading', { name: /\$29.99/i })
      expect(price).toBeInTheDocument()
    })

    it('renders pricing disclaimer', () => {
      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          organizationName={organizationName}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const disclaimer = screen.getByText(
        /\*\$12 per user \/ month if paid monthly/i
      )
      expect(disclaimer).toBeInTheDocument()
    })

    it('renders benefits section', () => {
      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          organizationName={organizationName}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const benefitOne = screen.getByText('Includes 5 seats')
      expect(benefitOne).toBeInTheDocument()

      const benefitTwo = screen.getByText('Unlimited public repositories')
      expect(benefitTwo).toBeInTheDocument()

      const benefitThree = screen.getByText('Unlimited private repositories')
      expect(benefitThree).toBeInTheDocument()

      const benefitFour = screen.getByText('Priority Support')
      expect(benefitFour).toBeInTheDocument()
    })

    it('renders cancellation link', () => {
      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          organizationName={organizationName}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const link = screen.getByRole('link', { name: /Cancel plan/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/gh/codecov/cancel')
    })
  })

  describe('user can not apply sentry plan', () => {
    const plan = proPlanMonth
    const plans = [plan]
    const organizationName = 'codecov'
    const accountDetails = {
      activatedUserCount: 5,
      subscriptionDetail: { cancelAtPeriodEnd: false },
    }

    it('renders correct image', () => {
      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          organizationName={organizationName}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const image = screen.getByRole('img', { name: 'parasol' })
      expect(image).toBeInTheDocument()
    })

    it('renders marketing name', () => {
      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          organizationName={organizationName}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const marketingName = screen.getByRole('heading', {
        name: 'Pro Team',
      })
      expect(marketingName).toBeInTheDocument()
    })

    it('renders price', () => {
      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          organizationName={organizationName}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const price = screen.getByRole('heading', { name: /\$10\*/i })
      expect(price).toBeInTheDocument()
    })

    it('renders pricing disclaimer', () => {
      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          organizationName={organizationName}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const disclaimer = screen.getByText(
        /\*\$12 per user \/ month if paid monthly/i
      )
      expect(disclaimer).toBeInTheDocument()
    })

    it('renders benefits section', () => {
      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          organizationName={organizationName}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const benefitOne = screen.getByText('Configurable # of users')
      expect(benefitOne).toBeInTheDocument()

      const benefitTwo = screen.getByText('Unlimited public repositories')
      expect(benefitTwo).toBeInTheDocument()

      const benefitThree = screen.getByText('Unlimited private repositories')
      expect(benefitThree).toBeInTheDocument()

      const benefitFour = screen.getByText('Priority Support')
      expect(benefitFour).toBeInTheDocument()
    })

    it('renders cancellation link', () => {
      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          organizationName={organizationName}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const link = screen.getByRole('link', { name: /Cancel plan/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/gh/codecov/cancel')
    })
  })

  describe('not rendering cancellation link', () => {
    describe('organization name is not provided', () => {
      it('does not render cancel link', () => {
        const plan = proPlanMonth
        const plans = [plan]
        const accountDetails = {
          activatedUserCount: 5,
          subscriptionDetail: { cancelAtPeriodEnd: false },
        }

        render(
          <UpgradeDetails
            accountDetails={accountDetails}
            plan={plan}
            plans={plans}
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
          />,
          { wrapper: wrapper() }
        )

        const link = screen.queryByRole('link', { name: /Cancel plan/ })
        expect(link).not.toBeInTheDocument()
      })
    })

    describe('user is on a free plan', () => {
      it('does not render cancel link', () => {
        const plan = freePlan
        const plans = [plan]
        const accountDetails = {
          activatedUserCount: 5,
          subscriptionDetail: { cancelAtPeriodEnd: false },
        }

        render(
          <UpgradeDetails
            accountDetails={accountDetails}
            plan={plan}
            plans={plans}
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
          />,
          { wrapper: wrapper() }
        )

        const link = screen.queryByRole('link', { name: /Cancel plan/ })
        expect(link).not.toBeInTheDocument()
      })
    })

    describe('user has already cancelled plan', () => {
      it('does not render cancel link', () => {
        const plan = proPlanMonth
        const plans = [plan]
        const organizationName = 'codecov'
        const accountDetails = {
          activatedUserCount: 5,
          subscriptionDetail: { cancelAtPeriodEnd: true },
        }

        render(
          <UpgradeDetails
            accountDetails={accountDetails}
            plan={plan}
            plans={plans}
            organizationName={organizationName}
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
          />,
          { wrapper: wrapper() }
        )

        const link = screen.queryByRole('link', { name: /Cancel plan/ })
        expect(link).not.toBeInTheDocument()
      })
    })
  })
})
