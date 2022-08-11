import { useRepoBackfilled } from 'services/repo'

export function useRepoBackfillingStatus() {
  const { data } = useRepoBackfilled()

  const { flagsMeasurementsActive, flagsMeasurementsBackfilled } = data
  const isRepoBackfilling =
    flagsMeasurementsActive && !flagsMeasurementsBackfilled
  return {
    flagsMeasurementsActive,
    flagsMeasurementsBackfilled,
    isRepoBackfilling,
  }
}
