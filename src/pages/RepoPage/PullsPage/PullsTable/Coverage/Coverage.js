import Icon from 'ui/Icon'
import { IconEnum } from './enums'
import Progress from 'ui/Progress'
import A from 'ui/A'
import PropTypes from 'prop-types'
import { PullRequestType } from '../../types'

const PullState = ({ state }) => {
  const icon = IconEnum.find((item) => state === item.state)

  return (
    <span className="text-ds-gray-quinary flex items-center">
      <Icon name={icon?.name} variant="developer" size="sm" />
    </span>
  )
}

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
  pull: PropTypes.shape(PullRequestType),
}

export default Coverage
