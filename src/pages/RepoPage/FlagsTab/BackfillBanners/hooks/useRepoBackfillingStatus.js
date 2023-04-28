import { useRepoBackfilled } from 'services/repo'

export function useRepoBackfillingStatus() {
  const { data } = useRepoBackfilled()

  const flagsMeasurementsActive = data?.flagsMeasurementsActive
  const flagsMeasurementsBackfilled = data?.flagsMeasurementsBackfilled
  const isTimescaleEnabled = data?.isTimescaleEnabled
  const isRepoBackfilling =
    flagsMeasurementsActive && !flagsMeasurementsBackfilled
  return {
    flagsMeasurementsActive,
    flagsMeasurementsBackfilled,
    isRepoBackfilling,
    isTimescaleEnabled,
  }
}
