import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'
import TotalsNumber from 'ui/TotalsNumber'

import { IconEnum } from './enums'

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

const Coverage = ({ head, state, pullId, plain = false }) =>
  typeof head?.totals?.coverage === 'number' ? (
    <div className="flex-1 justify-end flex flex-wrap md:flex-row md:flex-nowrap">
      <PullState state={state} />
      <A to={{ pageName: 'pullDetail', options: { pullId } }}>
        <span className="mx-6 text-ds-gray-quinary font-mono">#{pullId}</span>
      </A>
      <TotalsNumber value={head?.totals?.coverage} plain />
    </div>
  ) : (
    <div className="flex-1 justify-end flex flex-wrap md:flex-row md:flex-nowrap">
      <PullState state={state} />
      <A to={{ pageName: 'pullDetail', options: { pullId } }}>
        <span className="mx-6 text-ds-gray-quinary font-mono">#{pullId}</span>
      </A>
      <span className="flex-1 text-right text-ds-gray-quinary text-sm">
        No report uploaded yet
      </span>
    </div>
  )

Coverage.propTypes = {
  head: PropTypes.shape({
    totals: PropTypes.shape({
      coverage: PropTypes.number,
    }),
  }),
  pullId: PropTypes.number,
  state: PropTypes.string,
  plain: PropTypes.bool,
}

export default Coverage
