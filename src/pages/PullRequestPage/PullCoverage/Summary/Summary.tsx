import { useParams } from 'react-router-dom'

import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import Spinner from 'ui/Spinner'

import CompareSummary from './CompareSummary'

interface Params {
  provider: string
  owner: string
}

function Summary() {
  const { provider, owner } = useParams<Params>()
  const { data: settings, isLoading: settingsLoading } = useRepoSettingsTeam()
  const { data: tierData, isLoading } = useTier({ provider, owner })

  if (isLoading || settingsLoading) {
    return <Spinner />
  }

  if (tierData === TierNames.TEAM && settings?.repository?.private) {
    return null
  } else {
    return <CompareSummary />
  }
}

export default Summary
