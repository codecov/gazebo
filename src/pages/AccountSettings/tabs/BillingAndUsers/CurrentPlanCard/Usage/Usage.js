import { subDays } from 'date-fns'
import PropTypes from 'prop-types'
import { useParams } from 'react-router'

import { accountDetailsPropType } from 'services/account'
import { useUploadsNumber } from 'services/uploadsNumber/hooks'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Progress from 'ui/Progress'

const getRollingTimeWindow = () => {
  const today = new Date()
  const monthAgoDate = subDays(today, 30)

  const thisMonth = today.getMonth() + 1
  const thisDay = today.getDate()

  const lastMonth = monthAgoDate.getMonth() + 1
  const monthAgoDay = monthAgoDate.getDate()

  const currentDate = `${thisMonth}/${thisDay}`
  const monthAgo = `${lastMonth}/${monthAgoDay}`

  return {
    currentDate,
    monthAgo,
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

function Usage({ accountDetails, isBasicPlan }) {
  const { provider, owner } = useParams()
  const { data: uploadsNumber } = useUploadsNumber({ provider, owner })
  const maxUploadNumber = 250

  const progressAmount = (uploadsNumber * 100) / maxUploadNumber || 0 //sometimes we get null
  const isUsageExceeded = uploadsNumber >= maxUploadNumber
  const { currentDate, monthAgo } = getRollingTimeWindow()

  const variant = isUsageExceeded ? 'progressDanger' : 'progressNeutral'

  return (
    <div className="flex flex-col">
      <h2 className="font-semibold">Usage</h2>
      <ActiveUsers accountDetails={accountDetails} />
      {isBasicPlan && (
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
  isBasicPlan: PropTypes.bool.isRequired,
}

export default Usage
