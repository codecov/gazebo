import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import config from 'config'

import { SentryRoute } from 'sentry'

import { useAccountDetails } from 'services/account'
import { Theme, useThemeContext } from 'shared/ThemeContext'
import A from 'ui/A'
import { Alert } from 'ui/Alert'
import LoadingLogo from 'ui/LoadingLogo'

import { PlanProvider } from './context'
import PlanBreadcrumb from './PlanBreadcrumb'
import { PlanPageDataQueryOpts } from './queries/PlanPageDataQueryOpts'
import Tabs from './Tabs'


import { StripeAppearance } from '../../stripe'


const CancelPlanPage = lazy(() => import('./subRoutes/CancelPlanPage'))
const CurrentOrgPlan = lazy(() => import('./subRoutes/CurrentOrgPlan'))
const InvoicesPage = lazy(() => import('./subRoutes/InvoicesPage'))
const InvoiceDetailsPage = lazy(() => import('./subRoutes/InvoiceDetailsPage'))
const UpgradePlanPage = lazy(() => import('./subRoutes/UpgradePlanPage'))

const stripePromise = loadStripe(config.STRIPE_KEY, {
  apiVersion: '2024-04-10',
})
const path = '/plan/:provider/:owner'

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

function PlanPage() {
  const { owner, provider } = useParams()
  const { data: ownerData } = useSuspenseQueryV5(
    PlanPageDataQueryOpts({ owner, provider })
  )
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
  })

  const { theme } = useThemeContext()
  const isDarkMode = theme !== Theme.LIGHT

  if (config.IS_SELF_HOSTED || !ownerData?.isCurrentUserPartOfOrg) {
    return <Redirect to={`/${provider}/${owner}`} />
  }

  const isAwaitingVerification =
    accountDetails?.unverifiedPaymentMethods?.length
  // const isAwaitingFirstPaymentMethodVerification =
  //   !accountDetails?.subscriptionDetail?.defaultPaymentMethod &&
  //   isAwaitingVerification

  // const hasSuccessfulDefaultPaymentMethod =
  //   accountDetails?.subscriptionDetail?.defaultPaymentMethod

  return (
    <div className="flex flex-col gap-4">
      <Tabs />
      <Elements
        stripe={stripePromise}
        options={{
          ...StripeAppearance(isDarkMode),
          // mode and currency are required for the PaymentElement
          mode: 'setup',
          currency: 'usd',
        }}
      >
        <PlanProvider>
          <PlanBreadcrumb />
          {isAwaitingVerification ? (
            <UnverifiedPaymentMethodAlert
              url={
                accountDetails?.unverifiedPaymentMethods?.[0]
                  ?.hostedVerificationLink
              }
            />
          ) : null}
          <Suspense fallback={<Loader />}>
            <Switch>
              <SentryRoute path={path} exact>
                <CurrentOrgPlan />
              </SentryRoute>
              <SentryRoute path={`${path}/upgrade`} exact>
                <UpgradePlanPage />
              </SentryRoute>
              <SentryRoute path={`${path}/invoices`} exact>
                <InvoicesPage />
              </SentryRoute>
              <SentryRoute path={`${path}/invoices/:id`} exact>
                <InvoiceDetailsPage />
              </SentryRoute>
              <SentryRoute path={`${path}/cancel`}>
                <CancelPlanPage />
              </SentryRoute>
              <Redirect
                from="/plan/:provider/:owner/*"
                to="/plan/:provider/:owner"
              />
            </Switch>
          </Suspense>
        </PlanProvider>
      </Elements>
    </div>
  )
}

export default PlanPage

// eslint-disable-next-line react/prop-types
const UnverifiedPaymentMethodAlert = ({ url }) => {
  return (
    <>
      <Alert variant={'warning'}>
        <Alert.Title>New Payment Method Awaiting Verification</Alert.Title>
        <Alert.Description>
          Your new payment method requires verification.{' '}
          <A
            href={url}
            isExternal={true}
            hook="stripe-payment-method-verification"
            to={undefined}
          >
            Click here
          </A>{' '}
          to complete the verification process.
        </Alert.Description>
      </Alert>
      <br />
    </>
  )
}
