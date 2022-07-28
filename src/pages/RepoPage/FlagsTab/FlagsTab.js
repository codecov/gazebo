import { Suspense } from 'react'
import { Route, useParams } from 'react-router-dom'

import { useRepoBackfilled } from 'services/repo/hooks'
import { useRepoFlagsSelect } from 'services/repo/useRepoFlagsSelect'
import Spinner from 'ui/Spinner'

import FlagsNotConfigured from './FlagsNotConfigured'
import Header from './Header'
import FlagsTable from './subroute/FlagsTable/FlagsTable'
import SyncingBanner from './SyncingBanner'
import TriggerSyncBanner from './TriggerSyncBanner'

const Loader = (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

const getIsRepoBackfilling = ({
  flagsMeasurementsActive,
  flagsMeasurementsBackfilled,
}) => flagsMeasurementsActive && !flagsMeasurementsBackfilled
const isDisabled = ({ flagsMeasurementsActive, isRepoBackfilling }) =>
  !flagsMeasurementsActive || isRepoBackfilling

function FlagsTab() {
  const { provider, owner, repo } = useParams()
  const { data: flagsData } = useRepoFlagsSelect()
  const { data } = useRepoBackfilled({ provider, owner, repo })

  const { flagsMeasurementsActive, flagsMeasurementsBackfilled } = data

  const isRepoBackfilling = getIsRepoBackfilling({
    flagsMeasurementsActive,
    flagsMeasurementsBackfilled,
  })

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
            {!flagsMeasurementsActive && <TriggerSyncBanner />}
            {isRepoBackfilling && <SyncingBanner />}
          </Header>
          {/*TODO: Show blurred image instead of the table when backfill is running or not active*/}
          <div className="flex flex-1 flex-col gap-4">
            <Route path="/:provider/:owner/:repo/flags" exact>
              <Suspense fallback={Loader}>
                <FlagsTable />
              </Suspense>
            </Route>
          </div>
        </>
      ) : (
        <FlagsNotConfigured />
      )}
    </div>
  )
}

export default FlagsTab
