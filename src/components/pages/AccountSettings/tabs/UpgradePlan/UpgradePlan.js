import PropType from 'prop-types'

import Card from 'components/Card'
import { useAccountsAndPlans } from 'services/account'

import parasolImg from './parasol.png'
import UpgradePlanForm from './UpgradePlanForm'
import BenefitList from '../../shared/BenefitList'
import BackLink from '../../shared/BackLink'

function UpgradePlan({ provider, owner }) {
  const { data } = useAccountsAndPlans({ provider, owner })
  const { accountDetails, plans } = data

  const proPlanMonth = plans.find((plan) => plan.value === 'users-pr-inappm')
  const proPlanYear = plans.find((plan) => plan.value === 'users-pr-inappy')

  return (
    <div className="col-start-1 col-end-13">
      <div className="mt-8">
        <BackLink
          to={`/account/${provider}/${owner}`}
          textLink="Billing & Users"
        />
      </div>
      <div className="grid grid-cols-12 gap-8 mt-10">
        <div className="col-span-5">
          <Card className="flex flex-col items-center px-12 py-10">
            <div className="-mt-16 mb-4">
              <img src={parasolImg} alt="parasol" />
            </div>
            <h3 className="text-2xl text-pink-500 bold">
              {proPlanYear.marketingName}
            </h3>
            <h2 className="text-5xl bold mb-8">
              ${proPlanYear.baseUnitPrice}*
            </h2>
            <BenefitList
              benefits={proPlanYear.benefits}
              iconName="check"
              iconColor="text-pink-500"
            />
            <p className="text-gray-400 mt-4">
              *${proPlanMonth.baseUnitPrice} per user / month if paid monthly
            </p>
          </Card>
        </div>
        <div className="col-span-7">
          <Card className="p-8">
            <UpgradePlanForm
              proPlanYear={proPlanYear}
              proPlanMonth={proPlanMonth}
              accountDetails={accountDetails}
              provider={provider}
              owner={owner}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

UpgradePlan.propTypes = {
  provider: PropType.string.isRequired,
  owner: PropType.string.isRequired,
}

export default UpgradePlan
