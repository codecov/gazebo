import PropTypes from 'prop-types'
import capitalize from 'lodash/capitalize'
import cs from 'classnames'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useParams } from 'react-router-dom'

import A from 'ui/A'
import { getProviderPullURL } from 'shared/utils/provider'

const pullStateToColor = {
  OPEN: 'bg-ds-primary-green',
  CLOSED: 'bg-ds-primary-red',
  MERGED: 'bg-ds-primary-purple',
}

function PullHeader({ pull }) {
  const { provider, owner, repo } = useParams()

  return (
    <div className="border-b-1">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold mr-4">{pull.title}</h1>
        <div
          className={cs(
            'text-white font-bold px-3 py-0.5 text-xs rounded',
            pullStateToColor[pull.state]
          )}
        >
          {capitalize(pull.state)}
        </div>
      </div>
      <p className="text-ds-gray-quinary">
        {formatDistanceToNow(new Date(pull.updatestamp), {
          addSuffix: true,
        })}{' '}
        <A
          to={{
            pageName: 'owner',
            options: { owner: pull.author?.username },
          }}
        >
          {pull.author?.username}
        </A>{' '}
        authored{' '}
        <A
          variant="code"
          href={getProviderPullURL({
            provider,
            owner,
            repo,
            pullId: pull.pullId,
          })}
          isExternal={true}
        >
          {pull.pullId}
        </A>
      </p>
    </div>
  )
}

PullHeader.propTypes = {
  pull: PropTypes.shape({
    pullId: PropTypes.number.isRequired,
    title: PropTypes.string,
    state: PropTypes.oneOf(Object.keys(pullStateToColor)).isRequired,
    updatestamp: PropTypes.string.isRequired,
    author: PropTypes.shape({
      username: PropTypes.string,
    }),
  }).isRequired,
}

export default PullHeader
