import { useComponentsBackfilled } from 'services/repo'

export function useRepoBackfillingStatus() {
  const { data } = useComponentsBackfilled()

  const componentsMeasurementsActive = data?.componentsMeasurementsActive
  const componentsMeasurementsBackfilled =
    data?.componentsMeasurementsBackfilled
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
