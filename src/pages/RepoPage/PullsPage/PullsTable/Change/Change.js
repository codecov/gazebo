import PropTypes from 'prop-types'
import { PullRequestType } from '../../types'

const Change = ({ pull }) => {
  if (!pull?.head?.totals?.coverage) return ''
  const change = pull?.compareWithBase?.patchTotals?.coverage

  return (
    typeof change === 'number' && (
      <div className="flex justify-end w-full font-semibold">
        <span className={change <= 0 ? 'nf bg-red-100' : 'bg-green-100'}>
          {change}%
        </span>
      </div>
    )
  )
}

Change.propTypes = {
  pull: PropTypes.shape(PullRequestType),
}

export default Change
