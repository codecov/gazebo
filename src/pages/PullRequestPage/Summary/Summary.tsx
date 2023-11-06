import { useParams } from 'react-router-dom'

import { useRepoSettings } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import CompareSummary from './CompareSummary'

interface Params {
  provider: string
  owner: string
}

function Summary() {
  const { provider, owner } = useParams<Params>()
  const { data: settings, isLoading: settingsLoading } = useRepoSettings()
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })
  const { data: tierData, isLoading } = useTier({ provider, owner })

  if (isLoading || settingsLoading) {
    return null
  }

  if (
    multipleTiers &&
    tierData === TierNames.TEAM &&
    settings?.repository?.private
  ) {
    return null
  } else {
    return <CompareSummary />
  }
}

export default Summary
