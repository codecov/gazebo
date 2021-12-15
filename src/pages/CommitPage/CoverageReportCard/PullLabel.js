import PropTypes from 'prop-types'

import { providerToName } from 'shared/utils'

import Icon from 'ui/Icon'
import A from 'ui/A'

export default function PullLabel({ pullId, provider, providerPullUrl }) {
  if (pullId) {
    return (
      <div className="flex items-center">
        <span className="text-ds-gray-senary">
          <Icon size="sm" variant="developer" name="pull-request-open" />
        </span>
        <A to={{ pageName: 'pull', options: { pullid: pullId } }}>#{pullId}</A>(
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
