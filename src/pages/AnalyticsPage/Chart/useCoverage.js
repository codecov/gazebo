import { format } from 'date-fns'
import { useParams } from 'react-router-dom'

import { useOrgCoverage } from 'services/charts'
import { chartQuery, GroupingUnit } from 'shared/utils/legacyCharts'

/*
  Makes the legacy charting call and also massages the return to fit
  a data structure compatible with the chart.
*/
export const useCoverage = ({ params }, options = {}) => {
  const { provider, owner } = useParams()

  const { select, ...newOptions } = options
  const query = chartQuery(params)

  return useOrgCoverage({
    provider,
    owner,
    query,
    opts: {
      select: (data) => {
        const coverage = data.coverage.map((coverage) => ({
          ...coverage,
          date: new Date(coverage.date),
        }))
        const coverageAxisLabel = (time) => {
          if (query?.groupingUnit === GroupingUnit.DAY) {
            return format(time, 'MMM d')
          } else {
            return format(time, 'MMM yyyy')
          }
        }

        const newData = {
          ...data,
          coverageAxisLabel,
          coverage,
        }

        if (typeof select === 'function') {
          return select(newData)
        } else {
          return newData
        }
      },
      staleTime: 30000,
      keepPreviousData: false,
      ...newOptions,
    },
  })
}
