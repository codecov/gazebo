import { accountDetailsPropType } from 'services/account'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import Progress from 'ui/Progress'
import { useOwner } from 'services/user'

function Usage({ accountDetails, isFreePlan }) {
  const { data: info } = useOwner({ username: 'codecov' })
  console.log(info)
  return (
    <div className="flex flex-col">
      <h2 className="font-semibold">Usage</h2>
      <p className="mt-4">
        {accountDetails.activatedUserCount ?? 0} /{' '}
        {accountDetails.plan.quantity ?? 0} Active users
      </p>
      {/* change this here please  */}
      {!isFreePlan && (
        <Fragment>
          <p className="mt-4">224 of 250 uploads month 9.13 - 10. 03</p>
          <div className="mt-4">
            <Progress
              amount={(224 * 100) / 250}
              label={false}
              bgColor={'bg-ds-gray-senary'}
            />
          </div>
        </Fragment>
      )}
      <hr className="my-6" />
    </div>
  )
}

Usage.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
  isFreePlan: PropTypes.bool.isRequired,
}

export default Usage
