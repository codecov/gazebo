import { Suspense } from 'react'
import { Route, useParams } from 'react-router-dom'

import { useRepoBackfilled } from 'services/repo/hooks'
import Spinner from 'ui/Spinner'

import FlagsTable from './subroute/FlagsTable/FlagsTable'
import SyncingBanner from './SyncingBanner'
import TriggerSyncBanner from './TriggerSyncBanner'

function FlagsTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepoBackfilled({ provider, owner, repo })

  const { flagsMeasurementsActive, flagsMeasurementsBackfilled } = data
  const areMeasurementsInactive =
    !flagsMeasurementsActive && !flagsMeasurementsBackfilled
  const areFlagsSyncing =
    flagsMeasurementsActive && !flagsMeasurementsBackfilled

  const Loader = (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  )

  return (
    <div className="flex flex-col gap-4 mx-4 md:mx-0">
      <h1>Flags Header Component</h1>
      {areMeasurementsInactive && <TriggerSyncBanner />}
      {areFlagsSyncing && <SyncingBanner />}
      <div className="flex flex-1 flex-col gap-4 border-t border-solid border-ds-gray-secondary">
        <Route path="/:provider/:owner/:repo/flags" exact>
          <Suspense fallback={Loader}>
            <FlagsTable />
          </Suspense>
        </Route>
      </div>
    </div>
  )
}

export default FlagsTab
