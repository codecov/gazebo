import { accountDetailsPropType } from 'services/account'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import Progress from 'ui/Progress'

const RollingTimeWindow = () => {
  const today = new Date().getTime()
  console.log(today)
  return 13 //tbd
}

function Usage({ accountDetails, isFreePlan }) {
  return (
    <div className="flex flex-col">
      <h2 className="font-semibold">Usage</h2>
      <p className="mt-4">
        {accountDetails.activatedUserCount ?? 0} of{' '}
        {accountDetails.plan.quantity ?? 0} users
      </p>
      {isFreePlan && (
        <Fragment>
          <p className="mt-4">
            224 of 250 uploads month <RollingTimeWindow />
          </p>
          <div className="mt-4">
            <Progress amount={(20 * 100) / 250} label={false} useUsage={true} />
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
