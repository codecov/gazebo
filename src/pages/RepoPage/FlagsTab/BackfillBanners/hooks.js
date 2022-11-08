import { useRepoBackfilled } from 'services/repo'

export function useRepoBackfillingStatus() {
  const { data } = useRepoBackfilled()

  const flagsMeasurementsActive = data?.flagsMeasurementsActive
  const flagsMeasurementsBackfilled = data?.flagsMeasurementsBackfilled
  const isRepoBackfilling =
    flagsMeasurementsActive && !flagsMeasurementsBackfilled
  return {
    flagsMeasurementsActive,
    flagsMeasurementsBackfilled,
    isRepoBackfilling,
  }
}
