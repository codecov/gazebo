import isUndefined from 'lodash/isUndefined'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { TrialStatuses, useAccountDetails, usePlanData } from 'services/account'

import Activation from './Activation'
import AutoActivate from './AutoActivate'

function MemberActivation() {
  const { owner, provider } = useParams()
  const { data: accountDetails } = useAccountDetails({ owner, provider })

  const { data: planData } = usePlanData({
    provider,
    owner,
  })

  const planAutoActivate = accountDetails?.planAutoActivate

  const showAutoActivate =
    !isUndefined(planAutoActivate) &&
    !planData?.plan?.isTrialPlan &&
    planData?.plan?.trialStatus !== TrialStatuses.ONGOING

  return (
    <div className="border-2 border-ds-gray-primary">
      <Activation />
      {showAutoActivate && (
        <>
          {/* TODO: have this be created dynamically w/ a better parent component */}
          <hr className="mx-4" />
          <AutoActivate planAutoActivate={planAutoActivate} />
        </>
      )}
    </div>
  )
}

MemberActivation.propTypes = {
  activatedUserCount: PropTypes.number,
  planQuantity: PropTypes.number,
}

export default MemberActivation
