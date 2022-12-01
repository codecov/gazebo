import { Route } from 'react-router-dom'

import { useRepoFlagsSelect } from 'services/repo/useRepoFlagsSelect'

import blurredTable from './assets/blurredTable.png'
import BackfillBanners from './BackfillBanners/BackfillBanners'
import { useRepoBackfillingStatus } from './BackfillBanners/hooks'
import FlagsNotConfigured from './FlagsNotConfigured'
import Header from './Header'
import FlagsTable from './subroute/FlagsTable/FlagsTable'
import TimescaleDisabled from './TimescaleDisabled'

const isDisabled = ({ flagsMeasurementsActive, isRepoBackfilling }) =>
  !flagsMeasurementsActive || isRepoBackfilling

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

  const {
    flagsMeasurementsActive,
    isRepoBackfilling,
    flagsMeasurementsBackfilled,
    isTimescaleEnabled,
  } = useRepoBackfillingStatus()

  return (
    <div className="flex flex-col gap-4 mx-4 md:mx-0">
      {isTimescaleEnabled ? (
        showFlagsData({ flagsData }) ? (
          <>
            <Header
              controlsDisabled={isDisabled({
                flagsMeasurementsActive,
                isRepoBackfilling,
              })}
            >
              <BackfillBanners />
            </Header>
            <div className="flex flex-1 flex-col gap-4">
              {showFlagsTable({
                flagsMeasurementsActive,
                flagsMeasurementsBackfilled,
              }) ? (
                <Route path="/:provider/:owner/:repo/flags" exact>
                  <FlagsTable />
                </Route>
              ) : (
                <img
                  alt="Blurred flags table"
                  src={blurredTable}
                  className="h-auto max-w-full"
                />
              )}
            </div>
          </>
        ) : (
          <FlagsNotConfigured />
        )
      ) : (
        <TimescaleDisabled />
      )}
    </div>
  )
}

export default FlagsTab
