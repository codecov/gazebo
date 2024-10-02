import SyncingBanner from './SyncingBanner'
import TriggerSyncBanner from './TriggerSyncBanner'
import { useRepoBackfillingStatus } from './useRepoBackfillingStatus'

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
