import { Redirect, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { useRepoSettingsTeam } from 'services/repo'
import { useRepoFlagsSelect } from 'services/repo/useRepoFlagsSelect'
import { TierNames, useTier } from 'services/tier'
import FlagsNotConfigured from 'shared/FlagsNotConfigured'

import blurredTable from './assets/blurredTable.png'
import BackfillBanners from './BackfillBanners/BackfillBanners'
import { useRepoBackfillingStatus } from './BackfillBanners/hooks'
import Header from './Header'
import FlagsTable from './subroute/FlagsTable/FlagsTable'
import TimescaleDisabled from './TimescaleDisabled'

const isDisabled = ({ flagsMeasurementsActive, isRepoBackfilling }) => {
  return !flagsMeasurementsActive || isRepoBackfilling
}
const showFlagsTable = ({
  flagsMeasurementsActive,
  flagsMeasurementsBackfilled,
}) => {
  return flagsMeasurementsActive && flagsMeasurementsBackfilled
}

const showFlagsData = ({ flagsData }) => {
  return flagsData && flagsData?.length > 0
}

function FlagsTab() {
  const { data: flagsData } = useRepoFlagsSelect()
  const { provider, owner, repo } = useParams()
  const { data: tierData } = useTier({ owner, provider })
  const { data: repoSettings } = useRepoSettingsTeam()

  const {
    flagsMeasurementsActive,
    isRepoBackfilling,
    flagsMeasurementsBackfilled,
    isTimescaleEnabled,
  } = useRepoBackfillingStatus()

  if (tierData === TierNames.TEAM && repoSettings?.repository?.private) {
    return <Redirect to={`/${provider}/${owner}/${repo}`} />
  }

  if (!isTimescaleEnabled) {
    return <TimescaleDisabled />
  }

  if (!showFlagsData({ flagsData })) {
    return <FlagsNotConfigured />
  }

  return (
    <div className="mx-4 flex flex-col gap-4 pt-4 md:mx-0">
      <Header
        controlsDisabled={isDisabled({
          flagsMeasurementsActive,
          isRepoBackfilling,
        })}
      >
        {repoSettings?.isCurrentUserPartOfOrg ? (
          <BackfillBanners />
        ) : (
          <div className="mt-3 text-center">
            <hr />
            <p className="mt-4 p-3">Flag analytics is disabled.</p>
          </div>
        )}
      </Header>
      <div className="flex flex-1 flex-col gap-4">
        {showFlagsTable({
          flagsMeasurementsActive,
          flagsMeasurementsBackfilled,
        }) ? (
          <SentryRoute
            path={[
              '/:provider/:owner/:repo/flags',
              '/:provider/:owner/:repo/flags/:branch',
            ]}
            exact
          >
            <FlagsTable />
          </SentryRoute>
        ) : (
          <img
            alt="Blurred flags table"
            src={blurredTable}
            className="h-auto max-w-full"
          />
        )}
      </div>
    </div>
  )
}

export default FlagsTab
