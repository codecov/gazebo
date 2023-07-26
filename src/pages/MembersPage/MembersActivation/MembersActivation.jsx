import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { TrialStatuses, useAccountDetails, usePlanData } from 'services/account'
import { useFlags } from 'shared/featureFlags'
import { isTrialPlan } from 'shared/utils/billing'

import Activation from './Activation'
import AutoActivate from './AutoActivate'

function MemberActivation() {
  const { owner, provider } = useParams()
  const { data: accountDetails } = useAccountDetails({ owner, provider })

  const { codecovTrialMvp } = useFlags({
    codecovTrialMvp: false,
  })

  const { data: planData } = usePlanData({
    provider,
    owner,
    opts: {
      enabled: codecovTrialMvp,
    },
  })

  const planAutoActivate = accountDetails?.planAutoActivate

  if (codecovTrialMvp) {
    if (
      isTrialPlan(planData?.plan?.planName) &&
      planData?.plan?.trialStatus === TrialStatuses.ONGOING
    ) {
      return (
        <div className="border-2 border-ds-gray-primary">
          <Activation />
        </div>
      )
    }
  }

  return (
    <div className="border-2 border-ds-gray-primary">
      <Activation />
      {planAutoActivate !== undefined && (
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
