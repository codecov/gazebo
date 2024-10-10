import SyncingBanner from './SyncingBanner'
import TriggerSyncBanner from './TriggerSyncBanner'
import { useRepoBackfillingStatus } from './useRepoBackfillingStatus'

function BackfillBanners() {
  const { componentsMeasurementsActive, isRepoBackfilling } =
    useRepoBackfillingStatus()

  return (
    <>
      {!componentsMeasurementsActive && <TriggerSyncBanner />}
      {isRepoBackfilling && <SyncingBanner />}
    </>
  )
}

export default BackfillBanners
