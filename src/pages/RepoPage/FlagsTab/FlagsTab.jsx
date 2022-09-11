import { Route } from 'react-router-dom'

import { useRepoFlagsSelect } from 'services/repo/useRepoFlagsSelect'

import blurredTable from './assets/blurredTable.png'
import BackfillBanners from './BackfillBanners/BackfillBanners'
import { useRepoBackfillingStatus } from './BackfillBanners/hooks'
import FlagsNotConfigured from './FlagsNotConfigured'
import Header from './Header'
import FlagsTable from './subroute/FlagsTable/FlagsTable'

const isDisabled = ({ flagsMeasurementsActive, isRepoBackfilling }) =>
  !flagsMeasurementsActive || isRepoBackfilling

function FlagsTab() {
  const { data: flagsData } = useRepoFlagsSelect()

  const {
    flagsMeasurementsActive,
    isRepoBackfilling,
    flagsMeasurementsBackfilled,
  } = useRepoBackfillingStatus()

  return (
    <div className="flex flex-col gap-4 mx-4 md:mx-0">
      {flagsData && flagsData.length > 0 ? (
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
            {flagsMeasurementsActive && flagsMeasurementsBackfilled ? (
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
      )}
    </div>
  )
}

export default FlagsTab
