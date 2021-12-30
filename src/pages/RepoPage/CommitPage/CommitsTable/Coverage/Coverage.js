import Progress from 'ui/Progress'
import { commitRequestType } from 'shared/propTypes'

const Coverage = ({ commit }) => {
  return (
    <div className="w-full justify-end flex">
      {typeof commit?.totals?.coverage === 'number' ? (
        <span className="w-64">
          <Progress amount={commit?.totals?.coverage} label={true} />
        </span>
      ) : (
        <span className="text-ds-gray-quinary text-sm">
          No report uploaded yet
        </span>
      )}
    </div>
  )
}

Coverage.propTypes = {
  commit: commitRequestType,
}

export default Coverage
