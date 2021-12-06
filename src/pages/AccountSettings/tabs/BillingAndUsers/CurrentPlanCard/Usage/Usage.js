import { accountDetailsPropType } from 'services/account'
import PropTypes from 'prop-types'
import Progress from 'ui/Progress'
import Icon from 'ui/Icon'
import A from 'ui/A'

const getRollingTimeWindow = () => {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  const year = today.getFullYear()

  const currentDate = `${month}/${day}`
  const prevMonth = month === 1 ? 12 : month - 1

  const isLeapYear = (year) => new Date(year, 1, 29).getMonth() === 1
  const isDayExist = !(!isLeapYear(year) && month === 3 && day >= 29) //only if we the day does exist

  return {
    currentDate,
    monthAgo: isDayExist ? `${prevMonth}/${day}` : `${prevMonth}/28`,
  }
}

const ActiveUsers = ({ accountDetails }) => (
  <p className="my-4">
    {accountDetails.activatedUserCount ?? 0} of{' '}
    {accountDetails.plan.quantity ?? 0} users
  </p>
)

ActiveUsers.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
}

function Usage({ accountDetails, isFreePlan, show = false }) {
  const uploadsNumber = 250 //to do - get the uploads per owner
  const progressAmount = (uploadsNumber * 100) / 250
  const isUsageExceeded = uploadsNumber >= 250
  const { currentDate, monthAgo } = getRollingTimeWindow()
  const variant = isUsageExceeded ? 'progressDanger' : 'progressNeutral'

  return (
    <div className="flex flex-col">
      <h2 className="font-semibold">Usage</h2>
      <ActiveUsers accountDetails={accountDetails} />
      {show && ( //we would change this condition to check if the plan is free.
        <div className="grid gap-4">
          <p>
            {uploadsNumber} of 250 uploads month{' '}
            {`${monthAgo} - ${currentDate}`}
          </p>
          <div>
            <Progress amount={progressAmount} label={false} variant={variant} />
          </div>
          {isUsageExceeded && (
            <div className="flex flex-col">
              <div className="flex flex-row">
                <span className="text-ds-primary-red">
                  <Icon name="exclamation" variant="solid" />{' '}
                </span>
                <p className="font-semibold ml-1">
                  usage exceeded upload limit
                </p>
              </div>
              <p className="mt-4">
                <span className="font-semibold">Tip:</span> upgrade to 6 users
                for unlimited uploads{' '}
                <A to={{ pageName: 'upgradePlan' }}> upgrade today </A>
              </p>
            </div>
          )}
        </div>
      )}
      <hr className="my-6" />
    </div>
  )
}

Usage.propTypes = {
  accountDetails: accountDetailsPropType.isRequired,
  isFreePlan: PropTypes.bool.isRequired,
  show: PropTypes.bool,
}

export default Usage
