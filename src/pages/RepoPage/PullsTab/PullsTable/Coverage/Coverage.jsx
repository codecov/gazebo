import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'
import TotalsNumber from 'ui/TotalsNumber'

import { IconEnum } from './enums'

const PullState = ({ state }) => {
  const icon = IconEnum.find((item) => state === item.state)

  return (
    <span className="flex items-center text-ds-gray-quinary">
      <Icon name={icon?.name} variant="developer" size="sm" />
    </span>
  )
}

PullState.propTypes = {
  state: PropTypes.string,
}

const Coverage = ({ head, state, pullId, plain = false }) =>
  typeof head?.totals?.percentCovered === 'number' ? (
    <div className="flex flex-1 flex-wrap justify-end md:flex-row md:flex-nowrap">
      <PullState state={state} />
      <A to={{ pageName: 'pullDetail', options: { pullId } }}>
        <span className="mx-6 font-mono text-ds-gray-quinary">#{pullId}</span>
      </A>
      <TotalsNumber value={head?.totals?.percentCovered} plain />
    </div>
  ) : (
    <div className="flex flex-1 flex-wrap justify-end md:flex-row md:flex-nowrap">
      <PullState state={state} />
      <A to={{ pageName: 'pullDetail', options: { pullId } }}>
        <span className="mx-6 font-mono text-ds-gray-quinary">#{pullId}</span>
      </A>
      <span className="flex-1 text-right text-sm text-ds-gray-quinary">
        No report uploaded yet
      </span>
    </div>
  )

Coverage.propTypes = {
  head: PropTypes.shape({
    totals: PropTypes.shape({
      percentCovered: PropTypes.number,
    }),
  }),
  pullId: PropTypes.number,
  state: PropTypes.string,
  plain: PropTypes.bool,
}

export default Coverage
