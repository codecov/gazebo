import difference from 'lodash/difference'
import PropType from 'prop-types'

import Card from 'old_ui/Card'
import { useAccountDetails, usePlans } from 'services/account'
import { useNavLinks } from 'services/navigation'
import { isFreePlan } from 'shared/utils/billing'

import DowngradeToFree from './DowngradeToFree'
import { useProPlanMonth } from './hooks'
import umbrellaImg from './umbrella.svg'

import BackLink from '../../shared/BackLink'
import BenefitList from '../../shared/BenefitList'

function CancelPlan({ provider, owner }) {
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = usePlans(provider)
  const { billingAndUsers } = useNavLinks()

  const { proPlanMonth } = useProPlanMonth({ plans })
  const freePlan = plans.find((plan) => isFreePlan(plan.value))

  const unavailableBenefits = difference(
    proPlanMonth.benefits,
    freePlan.benefits
  )

  return (
    <>
      <BackLink
        to={billingAndUsers.path()}
        useRouter={!billingAndUsers.isExternalLink}
        textLink={billingAndUsers.text}
      />
      <article className="grid grid-cols-12 gap-8 mt-10">
        <div className="col-span-7">
          <Card className="border border-codecov-red px-12 py-10">
            <h2 className="text-2xl text-codecov-red bold mb-4">
              Downgrading to Free
            </h2>
            <hr className="border-gray-200" />
            <p className="pt-6 pb-4 text-gray-500">
              Note that, when downgrading to free the following features will
              become unavailable:
            </p>
            <BenefitList
              benefits={unavailableBenefits}
              iconColor="text-codecov-red"
              iconName="times"
            />
            <hr className="border-gray-200 mt-6" />
            <p className="text-gray-500 mt-4">
              You currently have {accountDetails.activatedUserCount} active
              users. On downgrade, all users will be automatically deactivated.
              You will need to manually reactivate up to five users or ensure
              auto activate is enabled in your plan settings.
            </p>
            <div className="text-center mt-4">
              <DowngradeToFree
                accountDetails={accountDetails}
                provider={provider}
                owner={owner}
              />
            </div>
          </Card>
        </div>
        <div className="col-span-5">
          <Card className="flex flex-col items-center px-12 py-10">
            <div className="-mt-16 mb-4">
              <img src={umbrellaImg} alt="closed umbrella illustration" />
            </div>
            <h3 className="text-2xl text-pink-500 bold">
              {freePlan.marketingName}
            </h3>
            <h2 className="text-5xl bold mb-8">Free</h2>
            <BenefitList
              benefits={freePlan.benefits}
              iconName="check"
              iconColor="text-pink-500"
            />
          </Card>
        </div>
      </article>
    </>
  )
}

CancelPlan.propTypes = {
  provider: PropType.string.isRequired,
  owner: PropType.string.isRequired,
}

export default CancelPlan
