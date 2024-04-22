import { Redirect, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'

import BackfillBanners from './BackfillBanners/BackfillBanners'
import { useRepoBackfillingStatus } from './BackfillBanners/hooks'
import Header from './Header'
import ComponentsTable from './subroute/ComponentsTable/ComponentsTable'
import TimescaleDisabled from './TimescaleDisabled'

const isDisabled = ({ componentsMeasurementsActive, isRepoBackfilling }) => {
  return !componentsMeasurementsActive || isRepoBackfilling
}
const showComponentsTable = ({
  componentsMeasurementsActive,
  componentsMeasurementsBackfilled,
}) => {
  return componentsMeasurementsActive && componentsMeasurementsBackfilled
}

function ComponentsTab() {
  const { provider, owner, repo } = useParams()
  const { data: tierData } = useTier({ owner, provider })
  const { data: repoSettings } = useRepoSettingsTeam()

  const {
    componentsMeasurementsActive,
    isRepoBackfilling,
    componentsMeasurementsBackfilled,
    isTimescaleEnabled,
  } = useRepoBackfillingStatus()

  if (tierData === TierNames.TEAM && repoSettings?.repository?.private) {
    return <Redirect to={`/${provider}/${owner}/${repo}`} />
  }

  if (!isTimescaleEnabled) {
    return <TimescaleDisabled />
  }

  return (
    <div className="mx-4 flex flex-col gap-4 md:mx-0">
      <Header
        controlsDisabled={isDisabled({
          componentsMeasurementsActive,
          isRepoBackfilling,
        })}
      >
        <BackfillBanners />
      </Header>
      <div className="flex flex-1 flex-col gap-4">
        {showComponentsTable({
          componentsMeasurementsActive,
          componentsMeasurementsBackfilled,
        }) && (
          <SentryRoute path="/:provider/:owner/:repo/components" exact>
            <ComponentsTable />
          </SentryRoute>
        )}
      </div>
    </div>
  )
}

export default ComponentsTab
