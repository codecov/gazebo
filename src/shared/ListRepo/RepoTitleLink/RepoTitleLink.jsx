import PropTypes from 'prop-types'

import AppLink from 'shared/AppLink'
import Icon from 'ui/Icon'

function Badge({ children }) {
  return (
    <span className="ml-2 h-min rounded border border-ds-gray-tertiary px-1 py-0.5 text-xs text-ds-gray-senary dark:bg-ds-gray-tertiary dark:text-ds-secondary-text">
      {children}
    </span>
  )
}

const getRepoIconName = ({ activated, isRepoPrivate, active }) =>
  !activated && active ? 'ban' : isRepoPrivate ? 'lock-closed' : 'globe-alt'

function RepoTitleLink({ repo, showRepoOwner, pageName, disabledLink }) {
  const options = {
    owner: repo.author.username,
    repo: repo.name,
  }

  const { private: isRepoPrivate, activated, active } = repo

  if (disabledLink) {
    return (
      <div className="flex items-center">
        <div className="flex cursor-default items-center text-ds-gray-quinary">
          <Icon
            size="sm"
            variant="solid"
            name={getRepoIconName({ activated, isRepoPrivate, active })}
          />
          <span className="ml-2.5 text-sm text-ds-secondary-text">
            {showRepoOwner && `${repo?.author?.username} / `}
            <span className="font-semibold">{repo.name}</span>
          </span>
        </div>
        {isRepoPrivate && <Badge>Private</Badge>}
        {active && !activated && <Badge>Deactivated</Badge>}
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <AppLink
        pageName={pageName}
        options={options}
        className="flex items-center text-ds-gray-quinary hover:underline"
      >
        <Icon
          size="sm"
          variant="solid"
          name={getRepoIconName({ activated, isRepoPrivate, active })}
        />
        <span className="ml-2.5 mr-1.5 text-sm text-ds-secondary-text">
          {showRepoOwner && `${repo?.author?.username} / `}
          <span className="font-semibold">{repo.name}</span>
        </span>
      </AppLink>
      {isRepoPrivate && <Badge>Private</Badge>}
      {active && !activated && <Badge>Deactivated</Badge>}
      {repo?.isDemo && <Badge>System generated</Badge>}
    </div>
  )
}

RepoTitleLink.propTypes = {
  repo: PropTypes.shape({
    private: PropTypes.bool.isRequired,
    activated: PropTypes.bool,
    active: PropTypes.bool.isRequired,
    author: PropTypes.shape({
      username: PropTypes.string,
    }),
    name: PropTypes.string,
    isDemo: PropTypes.bool,
  }),
  showRepoOwner: PropTypes.bool.isRequired,
  pageName: PropTypes.string.isRequired,
  disabledLink: PropTypes.bool.isRequired,
}

export default RepoTitleLink
