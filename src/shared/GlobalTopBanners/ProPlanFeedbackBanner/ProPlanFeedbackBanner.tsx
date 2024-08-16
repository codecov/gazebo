import { useParams } from 'react-router-dom'

import { TrialStatuses, usePlanData } from 'services/account'
import { TierNames, useTier } from 'services/tier'
import A from 'ui/A'
import TopBanner from 'ui/TopBanner'

const PRO_PLAN_FEEDBACK_BANNER_KEY = 'pro-feedback-banner'

interface URLParams {
  provider: string
  owner: string
}

const ProPlanFeedbackBanner = () => {
  const { provider, owner } = useParams<URLParams>()
  const { data: tierData } = useTier({ provider, owner })
  const { data: trialData } = usePlanData({ provider, owner })
  const isProPlan = tierData === TierNames.PRO
  const isTrialing = trialData?.plan?.trialStatus === TrialStatuses.ONGOING

  if (!isProPlan || isTrialing) {
    return null
  }

  return (
    <TopBanner localStorageKey={PRO_PLAN_FEEDBACK_BANNER_KEY}>
      <TopBanner.Start>
        <p className="items-center gap-1 md:flex">
          &#127775; We&apos;d love your thoughts and feedback in this
          <A
            to={{ pageName: 'proPlanFeedbackSurvey' }}
            isExternal
            hook="pro-plan-feedback-link"
          >
            1 minute survey.
          </A>
        </p>
      </TopBanner.Start>
      <TopBanner.End>
        <TopBanner.DismissButton>
          <span className="opacity-100"> Dismiss </span>
        </TopBanner.DismissButton>
      </TopBanner.End>
    </TopBanner>
  )
}

export default ProPlanFeedbackBanner
