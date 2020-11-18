import { Link } from 'react-router-dom'

import Card from 'components/Card'

import BenefitList from '../../../shared/BenefitList'

function CurrentPlanCard() {
  const accountDetails = {
    plan: {
      marketingName: 'Basic',
      baseUnitPrice: 0,
      benefits: ['Up to 5 users', 'Unlimited repos'],
      quantity: 5,
      value: 'users-free',
    },
    activatedUserCount: 2,
    inactiveUserCount: 1,
  }

  const isFreePlan = accountDetails.plan.value === 'users-free'

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
        <Link
          to="#"
          className="bg-blue-400 hover:bg-blue-700 hover:text-white visited:text-white text-white py-2 px-4 rounded-full"
        >
          {isFreePlan ? 'Upgrade plan to pro' : 'Change plan'}
        </Link>
        {isFreePlan && (
          <Link
            to="#"
            className="btn text-base text-gray-900 underline hover:underline mt-4"
          >
            Cancel
          </Link>
        )}
      </div>
    </Card>
  )
}

export default CurrentPlanCard
