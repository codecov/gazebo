import { useRepoBackfilled } from 'services/repo'

export function useRepoBackfillingStatus() {
  const { data } = useRepoBackfilled()

  const componentsMeasurementsActive = data?.flagsMeasurementsActive
  const componentsMeasurementsBackfilled = data?.flagsMeasurementsBackfilled
  const isTimescaleEnabled = data?.isTimescaleEnabled
  const isRepoBackfilling =
    componentsMeasurementsActive && !componentsMeasurementsBackfilled
  return {
    componentsMeasurementsActive,
    componentsMeasurementsBackfilled,
    isRepoBackfilling,
    isTimescaleEnabled,
  }
}
