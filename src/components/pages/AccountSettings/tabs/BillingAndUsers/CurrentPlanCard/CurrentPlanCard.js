import { Link } from 'react-router-dom'

import Button from 'components/Button'
import Card from 'components/Card'
import { useBaseUrl } from 'shared/router'
import { accountDetailsPropType } from 'services/account'

import BenefitList from '../../../shared/BenefitList'

function CurrentPlanCard({ accountDetails }) {
  const isFreePlan = accountDetails.plan.value === 'users-free'
  const baseUrl = useBaseUrl()

  return (
    <Card className="px-12 py-10 pb-4">
      <h3 className="text-lg text-pink-500 font-bold">
        {accountDetails.plan.marketingName}
      </h3>
      <h2 className="text-4xl uppercase">
        {isFreePlan ? 'Free' : `$${accountDetails.plan.baseUnitPrice}`}
      </h2>
      <div className="mt-8 text-sm border-gray-200">
        <BenefitList
          iconName="check"
          iconColor="text-pink-500"
          benefits={accountDetails.plan.benefits}
        />
      </div>
      <hr className="my-6" />
      <p className="mt-4">
        {accountDetails.activatedUserCount} / {accountDetails.plan.quantity}{' '}
        Active users
      </p>
      <p className="mt-3 text-codecov-red font-bold" data-test="inactive-users">
        {accountDetails.inactiveUserCount} Inactive users
      </p>

      <div className="flex flex-col items-center mt-6">
        <Button Component={Link} to={`${baseUrl}billing/upgrade`}>
          {isFreePlan ? 'Upgrade plan to pro' : 'Change plan'}
        </Button>
        {!isFreePlan && (
          <Button
            to={`${baseUrl}billing/cancel`}
            Component={Link}
            variant="text"
            color="gray"
            className="mt-4"
          >
            Cancel Plan
          </Button>
        )}
      </div>
    </Card>
  )
}

CurrentPlanCard.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
}

export default CurrentPlanCard
