import { format } from 'date-fns'
import { useParams } from 'react-router-dom'

const useChartDesc = (coverage) => {
  const { repo } = useParams()

  if (!coverage || !Array.isArray(coverage)) return ''

  const first = coverage[0]
  const last = coverage[coverage.length - 1]
  const firstDateFormatted = format(new Date(first.date), 'MMM dd, yyy')
  const lastDateFormatted = format(new Date(last.date), 'MMM dd, yyy')
  const coverageDiff = Math.abs(first.coverage, last.coverage)
  const change = first.coverage < last.coverage ? '+' : '-'

  return `${repo} coverage chart from ${firstDateFormatted} to ${lastDateFormatted}, coverage change is ${change}${coverageDiff}%`
}

export { useChartDesc }
