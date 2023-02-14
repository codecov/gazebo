import { format } from 'date-fns'
import PropTypes from 'prop-types'

import CoverageAreaChart from 'ui/CoverageAreaChart'

import { useCoverage } from './useCoverage'

const makeDesc = ({ data, first, last, repos = [] }) => {
  if (!data || data?.length === 0) return ''
  const firstDateFormatted = format(new Date(first.date), 'MMM dd, yyy')
  const lastDateFormatted = format(new Date(last.date), 'MMM dd, yyy')
  const coverageDiff = Math.abs(first.coverage, last.coverage)
  const change = first.coverage < last.coverage ? '+' : '-'

  return `${repos.join(
    ', '
  )} coverage chart from ${firstDateFormatted} to ${lastDateFormatted}, coverage change is ${change}${coverageDiff}%`
}

function Chart({ params }) {
  const { data, isPreviousData, isSuccess } = useCoverage(
    {
      params,
    },
    {
      suspense: false,
      keepPreviousData: true,
    }
  )

  const desc = makeDesc({
    data: data?.coverage,
    first: data?.coverage[0],
    last: data?.coverage[data?.coverage.length - 1],
    repos: params?.repositories ?? [],
  })

  return (
    <CoverageAreaChart
      axisLabelFunc={data?.coverageAxisLabel}
      data={data?.coverage}
      title={`${params?.repositories.join(', ')} coverage chart`}
      desc={desc}
      renderAreaChart={isPreviousData || isSuccess}
      aproxWidth={260.5}
      aproxHeight={47.5}
    />
  )
}

Chart.propTypes = {
  params: PropTypes.shape({
    startDate: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    endDate: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    repositories: PropTypes.array,
  }),
}

export default Chart
