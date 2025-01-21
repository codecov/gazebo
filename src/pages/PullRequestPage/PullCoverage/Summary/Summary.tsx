import { useParams } from 'react-router-dom'

import { useRepoSettingsTeam } from 'services/repo'
import { useIsTeamPlan } from 'services/useIsTeamPlan'
import Spinner from 'ui/Spinner'

import CompareSummary from './CompareSummary'

interface Params {
  provider: string
  owner: string
}

function Summary() {
  const { provider, owner } = useParams<Params>()
  const { data: settings, isLoading: settingsLoading } = useRepoSettingsTeam()
  const { data: isTeamPlan, isLoading } = useIsTeamPlan({ provider, owner })

  if (isLoading || settingsLoading) {
    return <Spinner />
  }

  if (isTeamPlan && settings?.repository?.private) {
    return null
  } else {
    return <CompareSummary />
  }
}

export default Summary
