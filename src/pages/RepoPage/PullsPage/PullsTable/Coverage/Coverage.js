import Icon from 'ui/Icon'
import { PullStateEnums } from '.'
import Progress from 'ui/Progress'
import A from 'ui/A'
import PropTypes from 'prop-types'

const PullState = ({ state }) => (
  <span className="text-ds-gray-quinary">
    {state === PullStateEnums.MERGED && (
      <Icon name="merge" variant="developer" size="sm" />
    )}
    {state === PullStateEnums.CLOSED && (
      <Icon name="pullRequestClosed" variant="developer" size="sm" />
    )}
    {state === PullStateEnums.OPEN && (
      <Icon name="pullRequestOpen" variant="developer" size="sm" />
    )}
  </span>
)

PullState.propTypes = {
  state: PropTypes.string,
}

const Coverage = ({ pull }) =>
  typeof pull?.head?.totals?.coverage === 'number' ? (
    <div className="w-full justify-end flex flex-wrap md:flex-row md:flex-nowrap">
      <PullState state={pull?.state} />
      <A to={{ pageName: 'pull', options: { pullid: pull?.pullId } }}>
        <span className="mx-6 text-ds-gray-quinary font-mono">
          #{pull?.pullId}
        </span>
      </A>
      <Progress amount={pull?.head?.totals?.coverage} label={true} />
    </div>
  ) : (
    <div className="w-full justify-end flex flex-wrap md:flex-row md:flex-nowrap">
      <PullState state={pull?.state} />
      <A to={{ pageName: 'pull', options: { pullid: pull?.pullId } }}>
        <span className="mx-6 text-ds-gray-quinary font-mono">
          #{pull?.pullId}
        </span>
      </A>
      <span className="text-ds-gray-quinary text-sm">
        No report uploaded yet
      </span>
    </div>
  )

Coverage.propTypes = {
  pull: PropTypes.shape({
    author: PropTypes.shape({
      username: PropTypes.string,
    }),
    compareWithBase: PropTypes.shape({
      patchTotals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    head: PropTypes.shape({
      totals: PropTypes.shape({
        coverage: PropTypes.number,
      }),
    }),
    pullId: PropTypes.number,
    state: PropTypes.string,
    title: PropTypes.string,
    updatestamp: PropTypes.string,
  }),
}

export default Coverage
