import { useParams } from 'react-router-dom'

import { TierNames, useTier } from 'services/tier'
import A from 'ui/A'
import TopBanner from 'ui/TopBanner'

const TEAM_PLAN_FEEDBACK_BANNER_KEY = 'team-feedback-banner'

interface URLParams {
  provider: string
  owner: string
}

const TeamPlanFeedbackBanner = () => {
  const { provider, owner } = useParams<URLParams>()
  const { data: tierData } = useTier({ provider, owner })
  const isTeamPlan = tierData === TierNames.TEAM

  if (!isTeamPlan) {
    return null
  }

  return (
    <TopBanner localStorageKey={TEAM_PLAN_FEEDBACK_BANNER_KEY}>
      <TopBanner.Start>
        <p className="items-center gap-1 md:flex">
          &#127775; We&apos;d love your thoughts and feedback about Codecov in
          this
          <A
            to={{ pageName: 'teamPlanFeedbackSurvey' }}
            isExternal
            hook="team-plan-feedback-link"
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

export default TeamPlanFeedbackBanner
