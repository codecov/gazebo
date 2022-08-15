import difference from 'lodash/difference'
import { useLayoutEffect } from 'react'
import { useParams } from 'react-router-dom'

import BenefitList from 'pages/AccountSettings/shared/BenefitList'
import { useAccountDetails, usePlans } from 'services/account'
import { isFreePlan } from 'shared/utils/billing'
import Card from 'ui/Card'

import CancelCard from './CancelButton'
import { useProPlanMonth } from './hooks'
import umbrellaImg from './umbrella.svg'

import { useSetCrumbs } from '../context'

function CancelPlanPage() {
  const { provider, owner } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = usePlans(provider)
  const setCrumbs = useSetCrumbs()

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: 'cancelOrgPlan',
        text: 'Cancel Plan',
      },
    ])
  }, [setCrumbs])

  const { proPlanMonth } = useProPlanMonth({ plans })
  const freePlan = plans.find((plan) => isFreePlan(plan?.value))

  const unavailableBenefits = difference(
    proPlanMonth?.benefits,
    freePlan?.benefits
  )

  return (
    <>
      <div className="flex gap-8">
        <div className="flex basis-3/5">
          <Card variant="cancel">
            <div className="flex flex-col gap-4 text-ds-gray-quinary">
              <h2 className="text-2xl text-codecov-red bold">
                Downgrading to Free
              </h2>
              <hr />
              <p>
                Note that, when downgrading to free the following features will
                become unavailable:
              </p>
              <BenefitList
                benefits={unavailableBenefits}
                iconColor="text-codecov-red"
                iconName="times"
              />
              <hr />
              <p>
                You currently have {accountDetails?.activatedUserCount} active
                users. On downgrade, all users will be automatically
                deactivated. You will need to manually reactivate up to five
                users or ensure auto activate is enabled in your plan settings.
              </p>
              {/* This is a weird component that is both a button and a modal, hence why it's imported this way. Defs not a good practice but I feel the overhaul of this component will be for another time */}
              <CancelCard
                customerId={accountDetails?.subscriptionDetail?.customer}
                planCost={accountDetails?.plan?.value}
                upComingCancelation={
                  accountDetails?.subscriptionDetail?.cancelAtPeriodEnd
                }
                currentPeriodEnd={
                  accountDetails?.subscriptionDetail?.currentPeriodEnd
                }
              />
            </div>
          </Card>
        </div>
        {/* TODO: Do we need this for the final iteration */}
        <div className="flex basis-2/5">
          <Card variant="large">
            <div className="-mt-16 mb-4">
              <img src={umbrellaImg} alt="closed umbrella illustration" />
            </div>
            <h3 className="text-2xl text-ds-pink-quinary bold">
              {freePlan?.marketingName}
            </h3>
            <h2 className="text-5xl bold mb-8">Free</h2>
            <BenefitList
              benefits={freePlan?.benefits}
              iconName="check"
              iconColor="text-ds-pink-quinary"
            />
          </Card>
        </div>
      </div>
    </>
  )
}

export default CancelPlanPage
