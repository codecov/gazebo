import PropTypes from 'prop-types'

import { providerToName } from 'shared/utils'
import A from 'ui/A'
import Icon from 'ui/Icon'

export default function PullLabel({ pullId, provider, providerPullUrl }) {
  if (pullId) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-ds-gray-senary">
          <Icon size="sm" variant="developer" name="pull-request-open" />
        </span>
        <A to={{ pageName: 'pullDetail', options: { pullId } }}>#{pullId}</A> (
        <A href={providerPullUrl} hook="provider url" isExternal={true}>
          {providerToName(provider)}
        </A>
        )
      </div>
    )
  }
  return null
}

PullLabel.propTypes = {
  pullId: PropTypes.number,
  provider: PropTypes.string,
  providerPullUrl: PropTypes.string,
}
