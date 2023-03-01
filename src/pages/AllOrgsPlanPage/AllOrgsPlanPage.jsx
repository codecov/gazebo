import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { lazy, Suspense } from 'react'

import config from 'config'

import Spinner from 'ui/Spinner'

import Header from './Header'
import Tabs from './Tabs'

const UpgradePlan = lazy(() => import('./UpgradePlan'))
const stripePromise = loadStripe(config.STRIPE_KEY)

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function AllReposPlanPage() {
  return (
    <div className="mt-2 flex flex-col gap-4">
      <Header />
      <Tabs />
      <section>
        <Suspense fallback={<Loader />}>
          <Elements stripe={stripePromise}>
            <UpgradePlan />
          </Elements>
        </Suspense>
      </section>
    </div>
  )
}

export default AllReposPlanPage
