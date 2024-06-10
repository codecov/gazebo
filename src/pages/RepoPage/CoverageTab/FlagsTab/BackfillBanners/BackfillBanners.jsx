import { useRepoBackfillingStatus } from './hooks'
import SyncingBanner from './SyncingBanner'
import TriggerSyncBanner from './TriggerSyncBanner'

function BackfillBanners() {
  const { flagsMeasurementsActive, isRepoBackfilling } =
    useRepoBackfillingStatus()

  return (
    <>
      {!flagsMeasurementsActive && <TriggerSyncBanner />}
      {isRepoBackfilling && <SyncingBanner />}
    </>
  )
}

export default BackfillBanners
