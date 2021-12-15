import { commitRequestType } from 'shared/propTypes'

const Change = ({ commit }) => {
  if (!commit?.totals?.coverage) return ''

  const coverage = commit?.totals?.coverage.toFixed(2)
  const parentCoverage = commit?.parent?.totals?.coverage.toFixed(2)
  const change = (coverage - parentCoverage).toFixed(2)

  return (
    !isNaN(change) && (
      <div className="flex justify-end w-full font-semibold">
        <span className={change < 0 ? 'bg-red-100' : 'bg-green-100'}>
          {change}%
        </span>
      </div>
    )
  )
}

Change.propTypes = {
  commit: commitRequestType,
}

export default Change
